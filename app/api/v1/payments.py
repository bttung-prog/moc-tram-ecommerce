from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.config import settings
from app.core.database import get_db
from app.core.security import verify_webhook_token
from app.schemas.payment_dto import (
    VietQRDetails, PaymentInitiateResponse,
    SePayWebhookPayload, PayPalWebhookPayload,
    PaymentTransactionResponse
)
from app.services.payment_service import payment_service
from app.services.order_service import order_service
from app.integrations.vietqr_client import vietqr_client
from app.models.payment import PaymentTransaction
from app.core.exceptions import BusinessRuleException

router = APIRouter(prefix="/payments", tags=["Payments & Webhooks (Thanh Toán & Cổng Ngân Hàng)"])


@router.get("/{order_code}/vietqr", response_model=VietQRDetails, summary="Lấy mã VietQR NAPAS 247 cho đơn hàng")
def get_vietqr_for_order(order_code: str, db: Session = Depends(get_db)):
    """Trả về thông tin mã QR động VietQR để hiển thị thanh toán trên giao diện."""
    order = order_service.get_order_by_code(db, order_code)
    qr_data = vietqr_client.generate_qr_payload(order.order_code, order.total_amount)
    return VietQRDetails(**qr_data)


@router.post("/sepay/webhook", summary="Webhook nhận thông báo biến động số dư VietQR (SePAY / Ngân Hàng)")
def handle_sepay_webhook(
    payload: SePayWebhookPayload,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
):
    """
    Webhook tiếp nhận giao dịch chuyển khoản VietQR tự động:
    - Xác thực Authorization Bearer token từ SePAY.
    - Phân tích nội dung chuyển khoản tìm mã đơn hàng (ví dụ 'DH2610218892').
    - Kiểm tra số tiền nhận được so với tổng tiền đơn.
    - Idempotency: Bỏ qua an toàn nếu giao dịch đã được xử lý trước đó.
    - Tự động chuyển đơn hàng sang CONFIRMED và trừ kho thực tế vĩnh viễn (Commit Stock)!
    """
    # Xác thực Webhook API key nếu có cấu hình
    if authorization:
        token = authorization.replace("Bearer ", "").replace("Apikey ", "").strip()
        if not verify_webhook_token(token, settings.SEPAY_WEBHOOK_API_KEY):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Webhook Secret Token không hợp lệ")

    res = payment_service.process_sepay_webhook(db, payload.model_dump())
    db.commit()
    return {"success": True, "result": res}


@router.post("/paypal/capture", summary="Capture xác nhận thanh toán PayPal v2")
async def capture_paypal_order(
    paypal_order_id: str,
    db: Session = Depends(get_db)
):
    """
    Sau khi khách hàng Approve đơn hàng trên trang PayPal:
    - Frontend / Backend gửi yêu cầu Capture để thực thu tiền.
    - Cập nhật đơn hàng thành CONFIRMED và commit kho.
    """
    res = await payment_service.process_paypal_capture_or_webhook(db, paypal_order_id)
    db.commit()
    return {"success": True, "data": res}


@router.post("/paypal/webhook", summary="Webhook thông báo sự kiện từ PayPal")
async def handle_paypal_webhook(
    payload: PayPalWebhookPayload,
    db: Session = Depends(get_db)
):
    """
    Tiếp nhận các sự kiện Webhook từ PayPal (CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED).
    """
    event_type = payload.event_type
    resource = payload.resource
    
    if event_type in ("PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.APPROVED"):
        paypal_order_id = resource.get("id") or resource.get("supplementary_data", {}).get("related_ids", {}).get("order_id")
        if paypal_order_id:
            try:
                res = await payment_service.process_paypal_capture_or_webhook(db, paypal_order_id)
                db.commit()
                return {"success": True, "event": event_type, "data": res}
            except Exception as e:
                return {"success": False, "error": str(e)}

    return {"success": True, "message": f"Event {event_type} ignored"}


@router.get("/transactions/{order_id}", response_model=List[PaymentTransactionResponse], summary="Lịch sử các giao dịch của đơn hàng")
def get_order_transactions(order_id: int, db: Session = Depends(get_db)):
    txs = db.query(PaymentTransaction).filter(PaymentTransaction.order_id == order_id).all()
    return [PaymentTransactionResponse.model_validate(t) for t in txs]
