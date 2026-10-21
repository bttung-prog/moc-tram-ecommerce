from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.integrations.shipping_client import shipping_client
from app.models.shipping import ShippingOrder, ShippingTrackingHistory, ShippingCarrier, ShippingStatus
from app.models.order import Order, OrderStatus, OrderStatusHistory
from app.core.exceptions import ResourceNotFoundException, ShippingException


class ShippingService:
    """
    Business Logic Vận Chuyển & Quản Lý Vận Đơn:
    - Tính toán cước giao hàng theo địa bàn & khối lượng gói hàng trầm/chuông.
    - Tạo vận đơn với GHN / GHTK.
    - Xử lý cập nhật lộ trình giao hàng (Tracking history & Carrier webhooks).
    """

    def calculate_shipping(
        self,
        province: str,
        district: str,
        ward: str,
        weight_grams: int,
        subtotal: float,
        carrier: ShippingCarrier = ShippingCarrier.GHN
    ) -> Dict[str, Any]:
        """Tính cước vận chuyển chuẩn xác."""
        actual_fee, original_fee, is_free, estimated_days = shipping_client.calculate_shipping_fee(
            province=province,
            district=district,
            ward=ward,
            weight_grams=weight_grams,
            subtotal=subtotal,
            carrier=carrier
        )
        return {
            "carrier": carrier,
            "shipping_fee": actual_fee,
            "original_fee": original_fee,
            "is_free_shipping": is_free,
            "estimated_days": estimated_days,
            "message": "Miễn phí vận chuyển cho đơn hàng từ 500,000đ" if is_free else f"Phí ship tiêu chuẩn: {actual_fee:,.0f}đ"
        }

    def create_shipping_order(
        self,
        db: Session,
        order_id: int,
        carrier: ShippingCarrier = ShippingCarrier.GHN,
        package_dimensions: str = "20x15x10",
        notes: str = ""
    ) -> ShippingOrder:
        """Tạo vận đơn chính thức khi kho đóng gói xong."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ResourceNotFoundException("Đơn hàng", order_id)

        # Kiểm tra nếu đơn hàng đã có vận đơn đang active
        existing = db.query(ShippingOrder).filter(ShippingOrder.order_id == order_id).first()
        if existing:
            return existing

        # Tính tổng cân nặng của đơn hàng
        total_weight = 0
        for item in order.items:
            # Ước lượng 300g mỗi item nếu không rõ
            total_weight += 300 * item.quantity

        cod_amount = order.total_amount if order.payment_method.value == "COD" else 0.0

        # Gọi carrier adapter
        waybill_data = shipping_client.create_waybill(
            carrier=carrier,
            order_code=order.order_code,
            recipient_name=order.customer_name,
            recipient_phone=order.customer_phone,
            recipient_address=f"{order.shipping_address}, {order.ward}, {order.district}, {order.province}",
            weight_grams=total_weight,
            cod_amount=cod_amount
        )

        shipping_order = ShippingOrder(
            order_id=order.id,
            carrier=carrier,
            tracking_number=waybill_data["tracking_number"],
            shipping_fee=order.shipping_fee,
            cod_amount=cod_amount,
            package_weight_grams=total_weight,
            package_dimensions=package_dimensions,
            status=ShippingStatus.READY_TO_PICK,
            recipient_name=order.customer_name,
            recipient_phone=order.customer_phone,
            recipient_address=f"{order.shipping_address}, {order.ward}, {order.district}, {order.province}",
            estimated_delivery_date=waybill_data["estimated_delivery_date"],
            label_url=waybill_data["label_url"]
        )
        db.add(shipping_order)
        db.flush()

        # Tạo lịch sử ban đầu
        initial_history = ShippingTrackingHistory(
            shipping_order_id=shipping_order.id,
            status=ShippingStatus.READY_TO_PICK,
            location="Kho Trầm Hương & Thiền Định (Khánh Hòa)",
            description="Đơn hàng đã đóng gói cẩn thận, đang chờ shipper GHN tiếp nhận"
        )
        db.add(initial_history)

        # Cập nhật Order status sang SHIPPING nếu đang CONFIRMED / PROCESSING
        if order.order_status in (OrderStatus.CONFIRMED, OrderStatus.PROCESSING):
            order.order_status = OrderStatus.SHIPPING
            db.add(OrderStatusHistory(
                order_id=order.id,
                from_status=order.order_status.value,
                to_status=OrderStatus.SHIPPING.value,
                reason=f"Đã bàn giao đơn vị vận chuyển {carrier.value} - Vận đơn: {shipping_order.tracking_number}",
                changed_by="LOGISTICS"
            ))

        db.flush()
        return shipping_order

    def update_tracking_status(
        self,
        db: Session,
        tracking_number: str,
        status: ShippingStatus,
        location: str,
        description: str
    ) -> ShippingOrder:
        """
        Cập nhật trạng thái lộ trình vận chuyển từ Webhook của hãng giao vận.
        Tự động cập nhật Order status khi giao thành công.
        """
        shipping_order = db.query(ShippingOrder).filter(
            ShippingOrder.tracking_number == tracking_number
        ).first()

        if not shipping_order:
            raise ResourceNotFoundException("Vận đơn", tracking_number)

        shipping_order.status = status
        
        # Thêm sự kiện tracking
        event = ShippingTrackingHistory(
            shipping_order_id=shipping_order.id,
            status=status,
            location=location,
            description=description,
            timestamp=datetime.utcnow()
        )
        db.add(event)

        # Đồng bộ trạng thái đơn hàng
        order = db.query(Order).filter(Order.id == shipping_order.order_id).first()
        if order:
            if status == ShippingStatus.DELIVERED and order.order_status != OrderStatus.DELIVERED:
                order.order_status = OrderStatus.DELIVERED
                # Nếu là đơn COD, khách nhận hàng đồng nghĩa đã trả tiền
                if order.payment_method.value == "COD":
                    order.payment_status = "PAID"
                
                db.add(OrderStatusHistory(
                    order_id=order.id,
                    from_status=OrderStatus.SHIPPING.value,
                    to_status=OrderStatus.DELIVERED.value,
                    reason=f"Hãng vận chuyển báo giao thành công tại {location}",
                    changed_by="CARRIER_WEBHOOK"
                ))

        db.flush()
        return shipping_order


shipping_service = ShippingService()
