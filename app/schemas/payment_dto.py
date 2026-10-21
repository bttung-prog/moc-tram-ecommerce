from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.payment import TransactionStatus


class VietQRDetails(BaseModel):
    bank_id: str = Field(..., example="MB")
    bank_name: str = Field("Ngân hàng TMCP Quân Đội (MB Bank)", example="MB Bank")
    account_no: str = Field(..., example="0399888999")
    account_name: str = Field(..., example="CTY TRAM HUONG THIEN AN")
    amount: float = Field(..., example=1850000.0)
    transfer_content: str = Field(..., example="DH100234")
    qr_data_string: str = Field(..., description="Chuỗi cú pháp chuẩn VietQR EMVCo")
    qr_image_url: str = Field(..., description="Link ảnh QR từ cổng VietQR")
    qr_base64: Optional[str] = Field(None, description="Ảnh QR chuẩn Base64 PNG inline")


class PayPalDetails(BaseModel):
    paypal_order_id: str = Field(..., example="8WD392019284")
    approve_url: str = Field(..., example="https://www.sandbox.paypal.com/checkoutnow?token=8WD392019284")
    amount_usd: float = Field(..., example=72.83)
    exchange_rate: float = Field(..., example=25400.0)
    status: str = Field(..., example="CREATED")


class PaymentInitiateResponse(BaseModel):
    order_code: str
    gateway: str
    amount: float
    currency: str
    status: TransactionStatus
    vietqr: Optional[VietQRDetails] = None
    paypal: Optional[PayPalDetails] = None
    instructions: str


class SePayWebhookPayload(BaseModel):
    id: int = Field(..., description="ID giao dịch SePAY", example=123456)
    gateway: str = Field("MBBank", description="Tên ngân hàng phát sinh giao dịch", example="MBBank")
    transactionDate: str = Field(..., example="2026-10-21 08:30:00")
    accountNumber: str = Field(..., example="0399888999")
    transferType: str = Field("in", example="in")
    transferAmount: float = Field(..., example=1850000.0)
    accumulated: Optional[float] = Field(0.0)
    code: Optional[str] = Field(None, example="MB-123984")
    content: str = Field(..., description="Nội dung chuyển khoản (chứa mã đơn)", example="Chuyen tien don hang DH100234")
    referenceCode: Optional[str] = Field(None, example="FT2612391293")
    description: Optional[str] = None


class PayPalWebhookPayload(BaseModel):
    id: str = Field(..., example="WH-9283749281")
    event_type: str = Field(..., example="PAYMENT.CAPTURE.COMPLETED")
    create_time: str = Field(..., example="2026-10-21T08:30:00Z")
    resource: Dict[str, Any] = Field(..., description="Nội dung chi tiết resource PayPal")


class PaymentTransactionResponse(BaseModel):
    id: int
    order_id: int
    transaction_code: str
    gateway: str
    amount: float
    currency: str
    status: TransactionStatus
    gateway_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
