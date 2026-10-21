from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from app.models.return_refund import ReturnReason, ReturnStatus, RefundMethod, RefundStatus


class ReturnItemRequest(BaseModel):
    order_item_id: int = Field(..., example=1)
    quantity: int = Field(..., ge=1, example=1)


class ReturnCreateRequest(BaseModel):
    order_code: str = Field(..., example="DH100234")
    customer_name: str = Field(..., example="Nguyễn Văn An")
    customer_email: EmailStr = Field(..., example="an.nguyen@thienquan.vn")
    customer_phone: str = Field(..., example="0901234567")
    reason: ReturnReason = Field(..., example=ReturnReason.DAMAGED_IN_TRANSIT)
    customer_note: Optional[str] = Field(None, example="Lư xông trầm bị nứt men gốm khi mở hộp bưu tá giao")
    proof_images: List[str] = Field(default_factory=list, example=["https://storage.zenagarwood.vn/proofs/lu-nut-men.jpg"])
    items: List[ReturnItemRequest] = Field(..., min_length=1)


class ReturnReviewRequest(BaseModel):
    status: ReturnStatus = Field(..., example=ReturnStatus.APPROVED, description="APPROVED hoặc REJECTED")
    admin_note: str = Field(..., example="Shop đã kiểm tra ảnh nứt gốm, chấp thuận đổi trả mới hoặc hoàn tiền")
    return_shipping_code: Optional[str] = Field(None, example="RETURN-GHN-991203")


class RefundProcessRequest(BaseModel):
    refund_method: RefundMethod = Field(..., example=RefundMethod.BANK_TRANSFER)
    bank_account_info: Optional[str] = Field(None, example="19036789123 - Techcombank - NGUYEN VAN AN")
    notes: Optional[str] = Field(None, example="Hoàn tiền 100% cho đơn hàng bị sự cố nứt vỡ")


class ReturnItemResponse(BaseModel):
    id: int
    order_item_id: int
    product_variant_id: int
    quantity: int
    restock_status: str

    class Config:
        from_attributes = True


class RefundRecordResponse(BaseModel):
    id: int
    refund_amount: float
    refund_method: RefundMethod
    gateway_refund_id: Optional[str] = None
    bank_account_info: Optional[str] = None
    status: RefundStatus
    notes: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReturnRequestResponse(BaseModel):
    id: int
    order_id: int
    request_code: str
    customer_name: str
    customer_phone: str
    customer_email: str
    reason: ReturnReason
    customer_note: Optional[str] = None
    status: ReturnStatus
    admin_note: Optional[str] = None
    return_shipping_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[ReturnItemResponse] = []
    refund_record: Optional[RefundRecordResponse] = None

    class Config:
        from_attributes = True
