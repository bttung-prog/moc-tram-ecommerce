from datetime import datetime, timedelta
from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.config import settings
from app.models.order import Order, OrderItem, OrderStatus, StockReservation, ReservationStatus
from app.models.product import ProductVariant
from app.core.exceptions import InsufficientStockException, ReservationExpiredException, ResourceNotFoundException


class InventoryService:
    """
    Quản lý kho hàng & Cơ chế Giữ hàng (Stock Reservation):
    - Đảm bảo tính nhất quán (ACID transaction) và an toàn đồng thời (Concurrency-safe).
    - Giữ hàng (reserve) khi khách tiến hành thanh toán trực tuyến (VietQR / PayPal) với TTL 15 phút.
    - Trừ kho thực tế (commit) khi thanh toán thành công.
    - Nhả kho (release) khi đơn hàng bị hủy hoặc quá thời hạn thanh toán.
    - Nhập kho lại (restock) khi khách hàng đổi trả hàng thành công.
    """

    def reserve_stock(
        self,
        db: Session,
        order_id: int,
        items: List[Tuple[int, int]],  # List of (variant_id, quantity)
        ttl_minutes: int = settings.STOCK_RESERVATION_TTL_MINUTES
    ) -> List[StockReservation]:
        """
        Khóa giữ tồn kho cho danh sách sản phẩm trong đơn hàng.
        Kiểm tra nghiêm ngặt tồn kho khả dụng = stock_quantity - reserved_quantity.
        """
        reservations: List[StockReservation] = []
        expires_at = datetime.utcnow() + timedelta(minutes=ttl_minutes)

        for variant_id, quantity in items:
            # Truy vấn variant và khóa dòng (row locking nếu hỗ trợ)
            variant = db.query(ProductVariant).filter(
                ProductVariant.id == variant_id,
                ProductVariant.is_active == True
            ).with_for_update().first()

            if not variant:
                raise ResourceNotFoundException("Biến thể sản phẩm", variant_id)

            # Kiểm tra tồn kho khả dụng
            available_qty = variant.stock_quantity - variant.reserved_quantity
            if available_qty < quantity:
                raise InsufficientStockException(
                    product_name=variant.name,
                    sku=variant.sku,
                    requested=quantity,
                    available=max(0, available_qty)
                )

            # Cập nhật số lượng giữ hàng
            variant.reserved_quantity += quantity

            # Tạo bản ghi StockReservation
            reservation = StockReservation(
                order_id=order_id,
                variant_id=variant_id,
                quantity=quantity,
                status=ReservationStatus.ACTIVE,
                expires_at=expires_at
            )
            db.add(reservation)
            reservations.append(reservation)

        db.flush()
        return reservations

    def commit_stock_reservation(self, db: Session, order_id: int) -> None:
        """
        Xác nhận thanh toán thành công: Trừ tồn kho thực tế vĩnh viễn và giải phóng số lượng giữ hàng.
        """
        reservations = db.query(StockReservation).filter(
            StockReservation.order_id == order_id,
            StockReservation.status == ReservationStatus.ACTIVE
        ).all()

        for res in reservations:
            variant = db.query(ProductVariant).filter(ProductVariant.id == res.variant_id).first()
            if variant:
                # Trừ tồn kho thực tế và giảm lượng đang reserve
                variant.stock_quantity = max(0, variant.stock_quantity - res.quantity)
                variant.reserved_quantity = max(0, variant.reserved_quantity - res.quantity)
            
            res.status = ReservationStatus.COMMITTED

        db.flush()

    def release_stock_reservation(self, db: Session, order_id: int, reason: str = "ORDER_CANCELLED") -> int:
        """
        Nhả hàng đã giữ về lại kho khả dụng (khi đơn hủy hoặc hết hạn thanh toán).
        """
        released_count = 0
        reservations = db.query(StockReservation).filter(
            StockReservation.order_id == order_id,
            StockReservation.status == ReservationStatus.ACTIVE
        ).all()

        for res in reservations:
            variant = db.query(ProductVariant).filter(ProductVariant.id == res.variant_id).first()
            if variant:
                variant.reserved_quantity = max(0, variant.reserved_quantity - res.quantity)
            
            res.status = ReservationStatus.RELEASED
            released_count += 1

        db.flush()
        return released_count

    def restock_items(self, db: Session, variant_id: int, quantity: int) -> ProductVariant:
        """Nhập hàng trở lại kho khi đổi trả hàng thành công."""
        variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
        if not variant:
            raise ResourceNotFoundException("Biến thể sản phẩm", variant_id)

        variant.stock_quantity += quantity
        db.flush()
        return variant

    def cleanup_expired_reservations(self, db: Session) -> int:
        """
        Tác vụ nền (Background Worker):
        Tìm và nhả toàn bộ các lượt giữ hàng đã hết hạn (quá 15 phút mà khách chưa thanh toán).
        Đồng thời chuyển trạng thái đơn hàng sang CANCELLED (Timeout).
        """
        now = datetime.utcnow()
        expired_reservations = db.query(StockReservation).filter(
            StockReservation.status == ReservationStatus.ACTIVE,
            StockReservation.expires_at < now
        ).all()

        if not expired_reservations:
            return 0

        affected_order_ids = set()
        for res in expired_reservations:
            variant = db.query(ProductVariant).filter(ProductVariant.id == res.variant_id).first()
            if variant:
                variant.reserved_quantity = max(0, variant.reserved_quantity - res.quantity)
            
            res.status = ReservationStatus.RELEASED
            affected_order_ids.add(res.order_id)

        # Cập nhật các đơn hàng sang trạng thái CANCELLED
        for order_id in affected_order_ids:
            order = db.query(Order).filter(Order.id == order_id).first()
            if order and order.order_status == OrderStatus.AWAITING_PAYMENT:
                order.order_status = OrderStatus.CANCELLED
                order.cancel_reason = "Quá thời hạn giữ hàng thanh toán trực tuyến (TTL 15 phút)"

        db.commit()
        return len(affected_order_ids)


inventory_service = InventoryService()
