from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus, PaymentMethod, PaymentStatus


class OrderItemCreate(BaseModel):
    product_variant_id: int = Field(..., example=1)
    quantity: int = Field(..., ge=1, example=1)


class OrderCreateRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150, example="Nguyễn Văn An")
    customer_phone: str = Field(..., pattern=r"^(0|\+84)[3|5|7|8|9][0-9]{8}$", example="0901234567")
    customer_email: EmailStr = Field(..., example="an.nguyen@thienquan.vn")
    
    shipping_address: str = Field(..., example="Số 18 Đường Hoa Sen, Phường Bến Nghé")
    province: str = Field(..., example="Hồ Chí Minh")
    district: str = Field(..., example="Quận 1")
    ward: str = Field(..., example="Phường Bến Nghé")
    
    items: List[OrderItemCreate] = Field(..., min_length=1)
    coupon_code: Optional[str] = Field(None, example="THIENAN10")
    payment_method: PaymentMethod = Field(PaymentMethod.COD, example="VIETQR")
    customer_notes: Optional[str] = Field(None, example="Đóng hộp quà gỗ trầm sang trọng và gói kèm vụn trầm xông phòng")
    
    idempotency_key: Optional[str] = Field(None, description="Khóa chống trùng lặp gửi nhiều lần (UUID hoặc chuỗi ngẫu nhiên)")


class OrderItemResponse(BaseModel):
    id: int
    product_variant_id: int
    product_name: str
    variant_name: str
    sku: str
    unit_price: float
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True


class OrderStatusHistoryResponse(BaseModel):
    id: int
    from_status: Optional[str]
    to_status: str
    reason: Optional[str]
    changed_by: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_code: str
    customer_name: str
    customer_phone: str
    customer_email: str
    shipping_address: str
    province: str
    district: str
    ward: str
    
    subtotal_amount: float
    discount_amount: float
    shipping_fee: float
    total_amount: float
    coupon_code: Optional[str]
    
    order_status: OrderStatus
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    customer_notes: Optional[str]
    cancel_reason: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    
    items: List[OrderItemResponse] = []
    status_history: List[OrderStatusHistoryResponse] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[OrderResponse]


class OrderStatusUpdateRequest(BaseModel):
    target_status: OrderStatus = Field(..., example=OrderStatus.PROCESSING)
    reason: Optional[str] = Field(None, example="Đã kiểm tra chất lượng trầm hương và bắt đầu đóng gói")
    changed_by: str = Field("STAFF", example="Kho Trầm Hương")


class OrderCancelRequest(BaseModel):
    reason: str = Field(..., example="Khách hàng đổi ý muốn chọn loại trầm chìm nước cao cấp hơn")
    cancelled_by: str = Field("CUSTOMER", example="CUSTOMER")
