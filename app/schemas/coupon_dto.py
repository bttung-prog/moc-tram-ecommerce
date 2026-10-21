from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.coupon import DiscountType
from app.schemas.order_dto import OrderItemCreate


class CouponValidateRequest(BaseModel):
    code: str = Field(..., example="THIENAN10")
    subtotal: float = Field(..., ge=0, example=1200000.0)
    customer_phone: str = Field(..., example="0901234567")
    customer_email: EmailStr = Field(..., example="khachhang@thienan.vn")
    items: List[OrderItemCreate] = Field(default_factory=list)


class CouponValidateResponse(BaseModel):
    is_valid: bool
    code: str
    discount_type: Optional[DiscountType] = None
    discount_amount: float = 0.0
    final_subtotal: float
    message: str


class CouponCreateRequest(BaseModel):
    code: str = Field(..., min_length=3, max_length=50, example="TRAMVIP500")
    description: Optional[str] = Field(None, example="Giảm 500k cho đơn hàng trầm hương cao cấp từ 2.000.000đ")
    discount_type: DiscountType = Field(..., example=DiscountType.FIXED_AMOUNT)
    discount_value: float = Field(..., ge=0, example=500000.0)
    max_discount_amount: Optional[float] = Field(None, example=500000.0)
    min_order_value: float = Field(0.0, ge=0, example=2000000.0)
    start_date: Optional[datetime] = None
    end_date: datetime = Field(..., example="2026-12-31T23:59:59")
    usage_limit_total: Optional[int] = Field(None, example=100)
    usage_limit_per_user: int = Field(1, ge=1, example=1)
    applicable_category_id: Optional[int] = Field(None, example=1)


class CouponResponse(BaseModel):
    id: int
    code: str
    description: Optional[str]
    discount_type: DiscountType
    discount_value: float
    max_discount_amount: Optional[float]
    min_order_value: float
    start_date: datetime
    end_date: datetime
    usage_limit_total: Optional[int]
    used_count: int
    usage_limit_per_user: int
    applicable_category_id: Optional[int]
    is_active: bool

    class Config:
        from_attributes = True
