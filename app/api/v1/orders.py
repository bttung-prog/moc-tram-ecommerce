from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.order import OrderStatus
from app.schemas.order_dto import (
    OrderCreateRequest, OrderResponse,
    OrderListResponse, OrderStatusUpdateRequest,
    OrderCancelRequest
)
from app.services.order_service import order_service

router = APIRouter(prefix="/orders", tags=["Orders (Quản Lý Đơn Hàng)"])


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Tạo mới đơn hàng & Giữ hàng tồn kho (Checkout)")
async def create_order(req: OrderCreateRequest, db: Session = Depends(get_db)):
    """
    Quy trình Checkout Tạo Đơn Hàng:
    - Kiểm tra tồn kho khả dụng và giữ kho (Stock Reservation) trong 15 phút.
    - Áp dụng mã giảm giá (Coupon validation) nếu có.
    - Tính cước vận chuyển chuẩn xác theo khối lượng gói hàng và tỉnh/thành.
    - Khởi tạo cổng thanh toán (COD / VietQR / PayPal).
    """
    order, payment_info = await order_service.create_order(db, req)
    return {
        "order": OrderResponse.model_validate(order),
        "payment": payment_info
    }


@router.get("", response_model=OrderListResponse, summary="Danh sách đơn hàng (Bộ lọc & Phân trang)")
def list_orders(
    status: Optional[OrderStatus] = Query(None, description="Lọc theo trạng thái đơn"),
    phone: Optional[str] = Query(None, description="Lọc theo số điện thoại"),
    email: Optional[str] = Query(None, description="Lọc theo email khách"),
    page: int = Query(1, ge=1, description="Số trang"),
    page_size: int = Query(20, ge=1, le=100, description="Số đơn mỗi trang"),
    db: Session = Depends(get_db)
):
    orders, total = order_service.list_orders(
        db=db,
        status=status,
        phone=phone,
        email=email,
        page=page,
        page_size=page_size
    )
    return OrderListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[OrderResponse.model_validate(o) for o in orders]
    )


@router.get("/{order_code}", response_model=OrderResponse, summary="Chi tiết đơn hàng theo mã (e.g. DH2610218892)")
def get_order_by_code(order_code: str, db: Session = Depends(get_db)):
    order = order_service.get_order_by_code(db, order_code)
    return OrderResponse.model_validate(order)


@router.patch("/{order_id}/status", response_model=OrderResponse, summary="Cập nhật trạng thái đơn hàng (State Machine)")
def update_order_status(order_id: int, req: OrderStatusUpdateRequest, db: Session = Depends(get_db)):
    order = order_service.update_order_status(
        db=db,
        order_id=order_id,
        target_status=req.target_status,
        reason=req.reason,
        changed_by=req.changed_by
    )
    return OrderResponse.model_validate(order)


@router.post("/{order_id}/cancel", response_model=OrderResponse, summary="Hủy đơn hàng & Nhả tồn kho đã giữ")
def cancel_order(order_id: int, req: OrderCancelRequest, db: Session = Depends(get_db)):
    order = order_service.cancel_order(
        db=db,
        order_id=order_id,
        reason=req.reason,
        cancelled_by=req.cancelled_by
    )
    return OrderResponse.model_validate(order)
