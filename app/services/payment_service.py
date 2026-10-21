import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.integrations.vietqr_client import vietqr_client
from app.integrations.paypal_client import paypal_client
from app.models.payment import PaymentTransaction, TransactionStatus
from app.models.order import Order, OrderStatus, PaymentMethod, PaymentStatus, OrderStatusHistory
from app.schemas.payment_dto import VietQRDetails, PayPalDetails, PaymentInitiateResponse
from app.services.inventory_service import inventory_service
from app.core.exceptions import ResourceNotFoundException, PaymentProcessingException


class PaymentService:
    """
    Business Logic Thanh Toán & Tích Hợp Đa Kênh:
    - COD (Thu hộ khi giao hàng tận nơi).
    - VietQR / NAPAS 247 (Tự động sinh mã QR ngân hàng và xử lý Webhook SePAY/Casso).
    - PayPal REST API v2 (Dành cho kiều bào & khách quốc tế, xử lý capture & webhook).
    - Đảm bảo tính Idempotency (chống ghi nhận trùng tiền, chống commit trùng kho).
    """

    async def initiate_payment(
        self,
        db: Session,
        order: Order,
        idempotency_key: Optional[str] = None
    ) -> PaymentInitiateResponse:
        """Khởi tạo giao dịch thanh toán theo phương thức người dùng lựa chọn."""
        
        # Kiểm tra idempotency nếu có
        if idempotency_key:
            existing_tx = db.query(PaymentTransaction).filter(
                PaymentTransaction.idempotency_key == idempotency_key
            ).first()
            if existing_tx:
                return self._build_initiate_response(existing_tx, order)

        tx_code = f"TX-{order.order_code}-{uuid.uuid4().hex[:6].upper()}"
        vietqr_details = None
        paypal_details = None
        instructions = ""
        approval_url = None
        qr_code_data = None
        raw_resp = {}

        if order.payment_method == PaymentMethod.COD:
            instructions = (
                "Quý khách đã chọn thanh toán khi nhận hàng (COD). "
                "Nhân viên Tĩnh Tâm Các sẽ liên hệ xác nhận và tiến hành đóng gói giao đến quý khách."
            )
            tx_status = TransactionStatus.PENDING

        elif order.payment_method == PaymentMethod.VIETQR:
            # Sinh mã VietQR
            qr_res = vietqr_client.generate_qr_payload(order.order_code, order.total_amount)
            qr_code_data = qr_res["qr_data_string"]
            vietqr_details = VietQRDetails(
                bank_id=qr_res["bank_id"],
                bank_name=qr_res["bank_name"],
                account_no=qr_res["account_no"],
                account_name=qr_res["account_name"],
                amount=qr_res["amount"],
                transfer_content=qr_res["transfer_content"],
                qr_data_string=qr_res["qr_data_string"],
                qr_image_url=qr_res["qr_image_url"],
                qr_base64=qr_res["qr_base64"]
            )
            instructions = (
                f"Vui lòng quét mã VietQR hoặc chuyển khoản đúng số tiền {order.total_amount:,.0f}đ "
                f"với nội dung: {qr_res['transfer_content']}. Hệ thống sẽ tự động duyệt đơn trong 30 giây."
            )
            tx_status = TransactionStatus.INITIATED
            raw_resp = qr_res

        elif order.payment_method == PaymentMethod.PAYPAL:
            # Tạo đơn PayPal v2
            pp_res = await paypal_client.create_order(order.order_code, order.total_amount)
            approval_url = pp_res["approve_url"]
            paypal_details = PayPalDetails(
                paypal_order_id=pp_res["paypal_order_id"],
                approve_url=pp_res["approve_url"],
                amount_usd=pp_res["amount_usd"],
                exchange_rate=pp_res["exchange_rate"],
                status=pp_res["status"]
            )
            instructions = (
                f"Vui lòng nhấp vào liên kết thanh toán PayPal để xác nhận số tiền ${pp_res['amount_usd']:.2f} USD."
            )
            tx_status = TransactionStatus.INITIATED
            raw_resp = pp_res

        else:
            raise PaymentProcessingException("Phương thức thanh toán không được hỗ trợ", gateway="UNKNOWN")

        # Lưu bản ghi PaymentTransaction
        transaction = PaymentTransaction(
            order_id=order.id,
            transaction_code=tx_code,
            gateway=order.payment_method.value,
            amount=order.total_amount,
            currency="USD" if order.payment_method == PaymentMethod.PAYPAL else "VND",
            status=tx_status,
            idempotency_key=idempotency_key,
            gateway_reference=paypal_details.paypal_order_id if paypal_details else None,
            qr_code_data=qr_code_data,
            approval_url=approval_url,
            raw_response=json.dumps(raw_resp)
        )
        db.add(transaction)
        db.flush()

        return PaymentInitiateResponse(
            order_code=order.order_code,
            gateway=order.payment_method.value,
            amount=order.total_amount,
            currency="USD" if order.payment_method == PaymentMethod.PAYPAL else "VND",
            status=tx_status,
            vietqr=vietqr_details,
            paypal=paypal_details,
            instructions=instructions
        )

    def _build_initiate_response(self, tx: PaymentTransaction, order: Order) -> PaymentInitiateResponse:
        """Tái cấu trúc response khi gặp request trùng lặp (Idempotent replay)."""
        vietqr_details = None
        paypal_details = None
        
        if tx.gateway == PaymentMethod.VIETQR.value and tx.raw_response:
            data = json.loads(tx.raw_response)
            vietqr_details = VietQRDetails(**data)
        elif tx.gateway == PaymentMethod.PAYPAL.value and tx.raw_response:
            data = json.loads(tx.raw_response)
            paypal_details = PayPalDetails(
                paypal_order_id=data.get("paypal_order_id", ""),
                approve_url=data.get("approve_url", ""),
                amount_usd=data.get("amount_usd", 0.0),
                exchange_rate=data.get("exchange_rate", 25400.0),
                status=data.get("status", "CREATED")
            )

        return PaymentInitiateResponse(
            order_code=order.order_code,
            gateway=tx.gateway,
            amount=tx.amount,
            currency=tx.currency,
            status=tx.status,
            vietqr=vietqr_details,
            paypal=paypal_details,
            instructions="Giao dịch thanh toán đã được khởi tạo trước đó."
        )

    def process_sepay_webhook(self, db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Xử lý Webhook biến động số dư VietQR / SePAY / Cổng ngân hàng:
        - Parse nội dung chuyển khoản tìm mã đơn hàng.
        - Kiểm tra số tiền khớp.
        - Idempotent: Nếu đơn đã thanh toán thì bỏ qua an toàn.
        - Chuyển trạng thái Order sang CONFIRMED và commit trừ tồn kho thực tế!
        """
        content = payload.get("content", "")
        transfer_amount = float(payload.get("transferAmount", 0.0))
        transfer_type = payload.get("transferType", "in")

        if transfer_type != "in":
            return {"status": "ignored", "reason": "Not an incoming transfer"}

        order_code = vietqr_client.parse_order_code_from_content(content)
        if not order_code:
            return {"status": "unrecognized", "reason": "No order code found in transfer content"}

        order = db.query(Order).filter(
            Order.order_code.ilike(f"%{order_code}%")
        ).first()

        if not order:
            return {"status": "order_not_found", "order_code": order_code}

        # Kiểm tra Idempotency: Nếu đơn đã được đánh dấu thanh toán trước đó
        if order.payment_status == PaymentStatus.PAID:
            return {
                "status": "already_processed",
                "order_code": order.order_code,
                "message": "Đơn hàng đã được thanh toán trước đó"
            }

        # Kiểm tra số tiền chuyển khoản
        if transfer_amount < order.total_amount:
            return {
                "status": "partial_payment_warning",
                "order_code": order.order_code,
                "transferred": transfer_amount,
                "required": order.total_amount,
                "message": "Số tiền chuyển khoản chưa đủ tổng giá trị đơn hàng"
            }

        # Cập nhật PaymentTransaction
        tx = db.query(PaymentTransaction).filter(
            PaymentTransaction.order_id == order.id,
            PaymentTransaction.gateway == PaymentMethod.VIETQR.value
        ).first()

        if tx:
            tx.status = TransactionStatus.SUCCESS
            tx.gateway_reference = str(payload.get("referenceCode") or payload.get("id"))
            tx.raw_response = json.dumps(payload)

        # Cập nhật trạng thái Order
        prev_status = order.order_status.value
        order.payment_status = PaymentStatus.PAID
        order.order_status = OrderStatus.CONFIRMED

        # Commit stock reservation: Trừ tồn kho thực tế vĩnh viễn
        inventory_service.commit_stock_reservation(db, order.id)

        # Ghi nhận lịch sử đơn hàng
        db.add(OrderStatusHistory(
            order_id=order.id,
            from_status=prev_status,
            to_status=OrderStatus.CONFIRMED.value,
            reason=f"Thanh toán VietQR thành công qua ngân hàng {payload.get('gateway')} - Số tiền {transfer_amount:,.0f}đ",
            changed_by="VIETQR_WEBHOOK"
        ))

        db.flush()
        return {
            "status": "success",
            "order_code": order.order_code,
            "order_status": order.order_status.value,
            "payment_status": order.payment_status.value
        }

    async def process_paypal_capture_or_webhook(
        self,
        db: Session,
        paypal_order_id: str
    ) -> Dict[str, Any]:
        """
        Capture tiền và hoàn tất đơn hàng PayPal.
        """
        tx = db.query(PaymentTransaction).filter(
            PaymentTransaction.gateway_reference == paypal_order_id
        ).first()

        if not tx:
            raise ResourceNotFoundException("Giao dịch PayPal", paypal_order_id)

        order = db.query(Order).filter(Order.id == tx.order_id).first()
        if not order:
            raise ResourceNotFoundException("Đơn hàng", tx.order_id)

        # Idempotency check
        if tx.status == TransactionStatus.SUCCESS:
            return {"status": "already_completed", "order_code": order.order_code}

        capture_res = await paypal_client.capture_order(paypal_order_id)
        if capture_res["status"] == "COMPLETED":
            tx.status = TransactionStatus.SUCCESS
            tx.raw_response = json.dumps(capture_res)

            prev_status = order.order_status.value
            order.payment_status = PaymentStatus.PAID
            order.order_status = OrderStatus.CONFIRMED

            # Trừ kho thực tế
            inventory_service.commit_stock_reservation(db, order.id)

            db.add(OrderStatusHistory(
                order_id=order.id,
                from_status=prev_status,
                to_status=OrderStatus.CONFIRMED.value,
                reason=f"Thanh toán PayPal quốc tế thành công - Capture ID: {capture_res['capture_id']}",
                changed_by="PAYPAL_GATEWAY"
            ))

            db.flush()
            return {"status": "success", "order_code": order.order_code, "capture_id": capture_res["capture_id"]}
        else:
            tx.status = TransactionStatus.FAILED
            db.flush()
            raise PaymentProcessingException("Capture tiền từ PayPal không thành công", gateway="PAYPAL")


payment_service = PaymentService()
