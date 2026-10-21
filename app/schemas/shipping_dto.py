from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.shipping import ShippingCarrier, ShippingStatus


class ShippingFeeCalculateRequest(BaseModel):
    province: str = Field(..., example="Hà Nội")
    district: str = Field(..., example="Hoàn Kiếm")
    ward: str = Field(..., example="Tràng Tiền")
    weight_grams: int = Field(500, ge=1, example=650)
    subtotal: float = Field(..., ge=0, example=1200000.0)


class ShippingFeeCalculateResponse(BaseModel):
    carrier: ShippingCarrier
    shipping_fee: float
    original_fee: float
    is_free_shipping: bool
    estimated_days: str
    message: str


class ShippingCreateWaybillRequest(BaseModel):
    order_id: int = Field(..., example=1)
    carrier: ShippingCarrier = Field(ShippingCarrier.GHN, example=ShippingCarrier.GHN)
    package_dimensions: Optional[str] = Field("20x15x10", example="20x15x10")
    notes: Optional[str] = Field("Hàng Trầm Hương & Chuông Thiền cao cấp, xin nhẹ tay chống sốc", example="Dễ vỡ")


class ShippingTrackingEventResponse(BaseModel):
    id: int
    status: ShippingStatus
    location: str
    description: str
    timestamp: datetime

    class Config:
        from_attributes = True


class ShippingOrderResponse(BaseModel):
    id: int
    order_id: int
    carrier: ShippingCarrier
    tracking_number: str
    shipping_fee: float
    cod_amount: float
    package_weight_grams: int
    package_dimensions: str
    status: ShippingStatus
    sender_name: str
    recipient_name: str
    recipient_phone: str
    recipient_address: str
    estimated_delivery_date: Optional[datetime] = None
    label_url: Optional[str] = None
    created_at: datetime
    tracking_history: List[ShippingTrackingEventResponse] = []

    class Config:
        from_attributes = True


class ShippingWebhookPayload(BaseModel):
    tracking_number: str = Field(..., example="GHN-VN-982138")
    status: ShippingStatus = Field(..., example=ShippingStatus.DELIVERED)
    location: str = Field(..., example="Bưu cục Hoàn Kiếm, Hà Nội")
    description: str = Field(..., example="Bưu tá đã giao hàng thành công cho khách hàng")
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    secret_token: Optional[str] = Field(None, example="ghn_webhook_signature_zen_2026")
