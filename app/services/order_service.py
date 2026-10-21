import random
from datetime import datetime
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.order import (
    Order, OrderItem, OrderStatus, OrderStatusHistory,
    PaymentMethod, PaymentStatus
)
from app.models.product import ProductVariant
from app.schemas.order_dto import OrderCreateRequest, OrderStatusUpdateRequest
from app.services.inventory_service import inventory_service
from app.services.coupon_service import coupon_service
from app.services.shipping_service import shipping_service
from app.services.payment_service import payment_service
from app.integrations.shipping_client import shipping_client
from app.core.exceptions import (
    ResourceNotFoundException,
    InvalidOrderStateTransitionException,
    BusinessRuleException
)


# Bảng ma trận chuyển đổi trạng thái hợp lệ (State Machine)
ALLOWED_STATE_TRANSITIONS = {
    OrderStatus.PENDING: [OrderStatus.AWAITING_PAYMENT, OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    OrderStatus.AWAITING_PAYMENT: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    OrderStatus.CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    OrderStatus.PROCESSING: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
    OrderStatus.SHIPPING: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    OrderStatus.DELIVERED: [OrderStatus.COMPLETED, OrderStatus.RETURN_REQUESTED],
    OrderStatus.COMPLETED: [OrderStatus.RETURN_REQUESTED],
    OrderStatus.RETURN_REQUESTED: [OrderStatus.RETURN_APPROVED, OrderStatus.RETURN_REJECTED],
    OrderStatus.RETURN_APPROVED: [OrderStatus.RETURN_IN_TRANSIT, OrderStatus.CANCELLED],
    OrderStatus.RETURN_REJECTED: [OrderStatus.COMPLETED],
    OrderStatus.RETURN_IN_TRANSIT: [OrderStatus.RETURNED],
    OrderStatus.RETURNED: [OrderStatus.REFUNDED],
    OrderStatus.CANCELLED: [],
    OrderStatus.REFUNDED: []
}


class OrderService:
    """
    Business Logic Xử Lý Đơn Hàng & Luồng Đặt Hàng (Checkout Flow):
    - Kiểm tra giỏ hàng, áp dụng coupon, tính cước vận chuyển.
    - Giữ hàng tồn kho nguyên tử (Atomic Stock Reservation).
    - Khởi tạo giao dịch thanh toán đa kênh (COD / VietQR / PayPal).
    - Quản lý máy trạng thái vòng đời đơn hàng (Order State Machine & Audit History).
    """

    def generate_order_code(self) -> str:
        """Sinh mã đơn hàng thân thiện duy nhất, ví dụ: DH2610218892"""
        today_str = datetime.utcnow().strftime("%y%m%d")
        rand_num = random.randint(1000, 9999)
        return f"DH{today_str}{rand_num}"

    async def create_order(self, db: Session, req: OrderCreateRequest) -> Tuple[Order, Any]:
        """
        Quy trình Checkout Tạo Đơn Hàng Hoàn Chỉnh:
        1. Kiểm tra biến thể & tính tạm tính (Subtotal)
        2. Xác thực và trừ mã giảm giá (Coupon validation)
        3. Tính cước vận chuyển (Shipping calculation)
        4. Tính tổng thanh toán cuối cùng
        5. Giữ tồn kho nguyên tử (Stock Reservation)
        6. Lưu Order & OrderItems
        7. Ghi nhận lịch sử dùng mã giảm giá (nếu có)
        8. Khởi tạo phương thức thanh toán
        """
        # 1. Thu thập biến thể và tính tiền
        variant_ids = [item.product_variant_id for item in req.items]
        variants = db.query(ProductVariant).filter(
            ProductVariant.id.in_(variant_ids),
            ProductVariant.is_active == True
        ).all()
        variant_map = {v.id: v for v in variants}

        if len(variants) != len(req.items):
            raise BusinessRuleException("Một hoặc nhiều sản phẩm trong giỏ hàng không tồn tại hoặc đã ngừng kinh doanh.")

        subtotal = 0.0
        total_weight = 0
        order_items_data = []

        for item in req.items:
            variant = variant_map[item.product_variant_id]
            item_subtotal = variant.price * item.quantity
            subtotal += item_subtotal
            total_weight += variant.weight_grams * item.quantity
            
            order_items_data.append({
                "variant": variant,
                "quantity": item.quantity,
                "unit_price": variant.price,
                "subtotal": item_subtotal
            })

        # 2. Xử lý Coupon & Giảm giá
        discount_amount = 0.0
        validated_coupon = None
        if req.coupon_code:
            coupon_obj, discount, _ = coupon_service.validate_coupon(
                db=db,
                code=req.coupon_code,
                subtotal=subtotal,
                customer_phone=req.customer_phone,
                customer_email=req.customer_email,
                variant_ids=variant_ids
            )
            discount_amount = discount
            validated_coupon = coupon_obj

        # 3. Tính phí vận chuyển
        shipping_info = shipping_service.calculate_shipping(
            province=req.province,
            district=req.district,
            ward=req.ward,
            weight_grams=total_weight,
            subtotal=subtotal
        )
        shipping_fee = shipping_info["shipping_fee"]

        # Nếu coupon là loại FREE_SHIPPING
        if validated_coupon and validated_coupon.discount_type.value == "FREE_SHIPPING":
            shipping_fee = 0.0

        # 4. Tính tổng thanh toán cuối cùng
        total_amount = max(0.0, subtotal - discount_amount + shipping_fee)

        # 5. Xác định trạng thái ban đầu
        if req.payment_method == PaymentMethod.COD:
            initial_order_status = OrderStatus.CONFIRMED
            initial_payment_status = PaymentStatus.UNPAID
        else:
            initial_order_status = OrderStatus.AWAITING_PAYMENT
            initial_payment_status = PaymentStatus.UNPAID

        # 6. Tạo Order
        order_code = self.generate_order_code()
        order = Order(
            order_code=order_code,
            customer_name=req.customer_name,
            customer_phone=req.customer_phone,
            customer_email=req.customer_email,
            shipping_address=req.shipping_address,
            province=req.province,
            district=req.district,
            ward=req.ward,
            subtotal_amount=subtotal,
            discount_amount=discount_amount,
            shipping_fee=shipping_fee,
            total_amount=total_amount,
            coupon_code=req.coupon_code,
            order_status=initial_order_status,
            payment_method=req.payment_method,
            payment_status=initial_payment_status,
            customer_notes=req.customer_notes
        )
        db.add(order)
        db.flush()

        # Tạo OrderItems
        for d in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_variant_id=d["variant"].id,
                product_name=d["variant"].product.name if d["variant"].product else "Sản phẩm",
                variant_name=d["variant"].name,
                sku=d["variant"].sku,
                unit_price=d["unit_price"],
                quantity=d["quantity"],
                subtotal=d["subtotal"]
            )
            db.add(order_item)

        # 7. Giữ tồn kho nguyên tử (Stock Reservation)
        items_to_reserve = [(d["variant"].id, d["quantity"]) for d in order_items_data]
        inventory_service.reserve_stock(db, order.id, items_to_reserve)

        # Nếu là COD: đã xác nhận đơn thì commit trừ kho ngay lập tức
        if req.payment_method == PaymentMethod.COD:
            inventory_service.commit_stock_reservation(db, order.id)

        # Ghi nhận Coupon usage nếu có
        if validated_coupon:
            coupon_service.record_coupon_usage(
                db=db,
                coupon_id=validated_coupon.id,
                order_id=order.id,
                customer_phone=req.customer_phone,
                customer_email=req.customer_email,
                discount_applied=discount_amount
            )

        # Ghi nhận lịch sử trạng thái ban đầu
        db.add(OrderStatusHistory(
            order_id=order.id,
            from_status=None,
            to_status=initial_order_status.value,
            reason="Khách hàng đặt đơn hàng trực tuyến thành công",
            changed_by="CUSTOMER"
        ))

        # 8. Khởi tạo thanh toán
        payment_info = await payment_service.initiate_payment(
            db=db,
            order=order,
            idempotency_key=req.idempotency_key
        )

        db.commit()
        db.refresh(order)
        return order, payment_info

    def get_order_by_code(self, db: Session, order_code: str) -> Order:
        """Tìm đơn hàng theo mã đơn hàng duy nhất."""
        order = db.query(Order).filter(Order.order_code == order_code).first()
        if not order:
            raise ResourceNotFoundException("Đơn hàng", order_code)
        return order

    def list_orders(
        self,
        db: Session,
        status: Optional[OrderStatus] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Order], int]:
        """Danh sách đơn hàng hỗ trợ bộ lọc và phân trang."""
        query = db.query(Order)
        if status:
            query = query.filter(Order.order_status == status)
        if phone:
            query = query.filter(Order.customer_phone.ilike(f"%{phone}%"))
        if email:
            query = query.filter(Order.customer_email.ilike(f"%{email}%"))

        total = query.count()
        orders = query.order_by(desc(Order.created_at)).offset((page - 1) * page_size).limit(page_size).all()
        return orders, total

    def update_order_status(
        self,
        db: Session,
        order_id: int,
        target_status: OrderStatus,
        reason: Optional[str] = None,
        changed_by: str = "STAFF"
    ) -> Order:
        """Chuyển trạng thái đơn hàng tuân theo sơ đồ State Machine."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ResourceNotFoundException("Đơn hàng", order_id)

        current_status = order.order_status
        allowed_targets = ALLOWED_STATE_TRANSITIONS.get(current_status, [])

        if target_status not in allowed_targets:
            raise InvalidOrderStateTransitionException(
                current_status=current_status.value,
                target_status=target_status.value
            )

        order.order_status = target_status
        db.add(OrderStatusHistory(
            order_id=order.id,
            from_status=current_status.value,
            to_status=target_status.value,
            reason=reason or f"Cập nhật trạng thái sang {target_status.value}",
            changed_by=changed_by
        ))

        db.commit()
        db.refresh(order)
        return order

    def cancel_order(
        self,
        db: Session,
        order_id: int,
        reason: str,
        cancelled_by: str = "CUSTOMER"
    ) -> Order:
        """
        Hủy đơn hàng và nhả hàng đã giữ về lại kho tồn khả dụng.
        Chỉ cho phép hủy nếu đơn chưa giao cho đơn vị vận chuyển (chưa sang SHIPPING).
        """
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ResourceNotFoundException("Đơn hàng", order_id)

        cancellable_statuses = [
            OrderStatus.PENDING,
            OrderStatus.AWAITING_PAYMENT,
            OrderStatus.CONFIRMED,
            OrderStatus.PROCESSING
        ]

        if order.order_status not in cancellable_statuses:
            raise BusinessRuleException(
                f"Đơn hàng đang ở trạng thái '{order.order_status.value}', không thể hủy trực tiếp. "
                "Quý khách vui lòng chờ nhận hàng và tạo yêu cầu Đổi/Trả (Return/Refund)."
            )

        prev_status = order.order_status.value
        order.order_status = OrderStatus.CANCELLED
        order.cancel_reason = reason

        # Nhả giữ kho nếu đơn đang giữ
        inventory_service.release_stock_reservation(db, order.id, reason=reason)

        db.add(OrderStatusHistory(
            order_id=order.id,
            from_status=prev_status,
            to_status=OrderStatus.CANCELLED.value,
            reason=f"Đơn hàng bị hủy bởi {cancelled_by}. Lý do: {reason}",
            changed_by=cancelled_by
        ))

        db.commit()
        db.refresh(order)
        return order


order_service = OrderService()
