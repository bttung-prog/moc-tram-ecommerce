import json
import random
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.integrations.paypal_client import paypal_client
from app.models.return_refund import (
    ReturnRequest, ReturnItem, RefundRecord,
    ReturnStatus, RefundMethod, RefundStatus
)
from app.models.order import Order, OrderStatus, PaymentStatus, OrderStatusHistory
from app.models.payment import PaymentTransaction
from app.schemas.return_refund_dto import ReturnCreateRequest, ReturnReviewRequest, RefundProcessRequest
from app.services.inventory_service import inventory_service
from app.core.exceptions import ResourceNotFoundException, BusinessRuleException


class ReturnRefundService:
    """
    Business Logic Xử Lý Đổi Trả & Hoàn Tiền (Return & Refund):
    - Tiếp nhận yêu cầu đổi trả (Lư trầm nứt gốm, chuông âm thanh không chuẩn, nhầm size vòng...).
    - Thẩm định (Approve / Reject) bởi bộ phận Chăm sóc khách hàng.
    - Nhận hàng hoàn tại kho & hoàn nhập tồn kho (Restock).
    - Thực hiện hoàn tiền qua PayPal API hoặc Chuyển khoản ngân hàng.
    """

    def generate_return_code(self) -> str:
        """Sinh mã yêu cầu đổi trả, ví dụ: RET261021882"""
        today_str = datetime.utcnow().strftime("%y%m%d")
        rand_num = random.randint(100, 999)
        return f"RET{today_str}{rand_num}"

    def create_return_request(self, db: Session, req: ReturnCreateRequest) -> ReturnRequest:
        """Khách hàng tạo yêu cầu đổi trả sau khi nhận hàng."""
        order = db.query(Order).filter(Order.order_code == req.order_code).first()
        if not order:
            raise ResourceNotFoundException("Đơn hàng", req.order_code)

        # Kiểm tra thông tin liên lạc xác thực
        if order.customer_phone != req.customer_phone:
            raise BusinessRuleException("Số điện thoại không khớp với thông tin đơn hàng đã đặt.")

        # Chỉ áp dụng đổi trả cho đơn đã giao thành công
        if order.order_status not in (OrderStatus.DELIVERED, OrderStatus.COMPLETED):
            raise BusinessRuleException(
                f"Đơn hàng hiện ở trạng thái '{order.order_status.value}', chưa đủ điều kiện đổi trả. "
                "Chính sách đổi trả áp dụng sau khi quý khách đã nhận hàng thành công."
            )

        # Kiểm tra sản phẩm hoàn có thuộc đơn hàng không
        order_item_ids = {item.id: item for item in order.items}
        for item_req in req.items:
            if item_req.order_item_id not in order_item_ids:
                raise BusinessRuleException(f"Mã chi tiết đơn hàng #{item_req.order_item_id} không thuộc đơn {req.order_code}.")

        req_code = self.generate_return_code()
        return_req = ReturnRequest(
            order_id=order.id,
            request_code=req_code,
            customer_name=req.customer_name,
            customer_phone=req.customer_phone,
            customer_email=req.customer_email,
            reason=req.reason,
            customer_note=req.customer_note,
            proof_images=json.dumps(req.proof_images),
            status=ReturnStatus.REQUESTED
        )
        db.add(return_req)
        db.flush()

        # Tạo ReturnItems
        for item_req in req.items:
            order_item = order_item_ids[item_req.order_item_id]
            ret_item = ReturnItem(
                return_request_id=return_req.id,
                order_item_id=order_item.id,
                product_variant_id=order_item.product_variant_id,
                quantity=item_req.quantity,
                restock_status="PENDING"
            )
            db.add(ret_item)

        # Cập nhật trạng thái Order
        prev_status = order.order_status.value
        order.order_status = OrderStatus.RETURN_REQUESTED
        db.add(OrderStatusHistory(
            order_id=order.id,
            from_status=prev_status,
            to_status=OrderStatus.RETURN_REQUESTED.value,
            reason=f"Khách hàng yêu cầu đổi trả (Mã: {req_code}) - Lý do: {req.reason.value}",
            changed_by="CUSTOMER"
        ))

        db.commit()
        db.refresh(return_req)
        return return_req

    def review_return_request(
        self,
        db: Session,
        request_id: int,
        review: ReturnReviewRequest
    ) -> ReturnRequest:
        """Admin thẩm định yêu cầu đổi trả."""
        return_req = db.query(ReturnRequest).filter(ReturnRequest.id == request_id).first()
        if not return_req:
            raise ResourceNotFoundException("Yêu cầu đổi trả", request_id)

        order = db.query(Order).filter(Order.id == return_req.order_id).first()
        
        return_req.status = review.status
        return_req.admin_note = review.admin_note
        if review.return_shipping_code:
            return_req.return_shipping_code = review.return_shipping_code

        if review.status == ReturnStatus.APPROVED:
            order.order_status = OrderStatus.RETURN_APPROVED
            reason = f"Shop chấp thuận yêu cầu đổi trả: {review.admin_note}"
        else:
            order.order_status = OrderStatus.RETURN_REJECTED
            reason = f"Shop từ chối yêu cầu đổi trả: {review.admin_note}"

        db.add(OrderStatusHistory(
            order_id=order.id,
            from_status=OrderStatus.RETURN_REQUESTED.value,
            to_status=order.order_status.value,
            reason=reason,
            changed_by="ADMIN_SUPPORT"
        ))

        db.commit()
        db.refresh(return_req)
        return return_req

    async def confirm_receipt_and_process_refund(
        self,
        db: Session,
        request_id: int,
        refund_req: RefundProcessRequest
    ) -> RefundRecord:
        """
        Kho xác nhận đã nhận hàng hoàn về:
        1. Nhập kho lại sản phẩm (Restock items)
        2. Tiến hành hoàn tiền qua cổng thanh toán (PayPal API) hoặc ngân hàng
        3. Cập nhật Order sang REFUNDED
        """
        return_req = db.query(ReturnRequest).filter(ReturnRequest.id == request_id).first()
        if not return_req:
            raise ResourceNotFoundException("Yêu cầu đổi trả", request_id)

        order = db.query(Order).filter(Order.id == return_req.order_id).first()
        if not order:
            raise ResourceNotFoundException("Đơn hàng", return_req.order_id)

        # 1. Hoàn nhập tồn kho cho từng sản phẩm trả về
        for item in return_req.items:
            inventory_service.restock_items(db, item.product_variant_id, item.quantity)
            item.restock_status = "RESTOCKED"

        # 2. Xử lý hoàn tiền
        gateway_refund_id = None
        refund_status = RefundStatus.COMPLETED

        if refund_req.refund_method == RefundMethod.PAYPAL_API:
            # Tìm giao dịch PayPal ban đầu
            tx = db.query(PaymentTransaction).filter(
                PaymentTransaction.order_id == order.id,
                PaymentTransaction.gateway == "PAYPAL"
            ).first()
            
            capture_id = tx.gateway_reference if tx else "MOCK-CAPTURE-ID"
            amount_usd = paypal_client.vnd_to_usd(order.total_amount)
            res = await paypal_client.refund_capture(capture_id, amount_usd, refund_req.notes or "")
            gateway_refund_id = res.get("refund_id")

        elif refund_req.refund_method == RefundMethod.BANK_TRANSFER:
            gateway_refund_id = f"BANK-REF-{random.randint(100000, 999999)}"

        elif refund_req.refund_method == RefundMethod.STORE_CREDIT:
            gateway_refund_id = f"VOUCHER-REFUND-{random.randint(1000, 9999)}"

        # Tạo bản ghi RefundRecord
        refund_record = RefundRecord(
            return_request_id=return_req.id,
            order_id=order.id,
            refund_amount=order.total_amount,
            refund_method=refund_req.refund_method,
            gateway_refund_id=gateway_refund_id,
            bank_account_info=refund_req.bank_account_info,
            status=refund_status,
            notes=refund_req.notes,
            processed_at=datetime.utcnow()
        )
        db.add(refund_record)

        # Cập nhật trạng thái
        return_req.status = ReturnStatus.COMPLETED
        prev_order_status = order.order_status.value
        order.order_status = OrderStatus.REFUNDED
        order.payment_status = PaymentStatus.REFUNDED

        db.add(OrderStatusHistory(
            order_id=order.id,
            from_status=prev_order_status,
            to_status=OrderStatus.REFUNDED.value,
            reason=f"Đã hoàn trả {order.total_amount:,.0f}đ qua {refund_req.refund_method.value} (Mã GD hoàn: {gateway_refund_id}) và nhập kho hoàn tất",
            changed_by="FINANCE_AND_WAREHOUSE"
        ))

        db.commit()
        db.refresh(refund_record)
        return refund_record


return_refund_service = ReturnRefundService()
