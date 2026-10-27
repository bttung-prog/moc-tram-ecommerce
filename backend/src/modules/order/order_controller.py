from datetime import datetime
from decimal import Decimal
from uuid import UUID

from fastapi import Depends, Query, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import ORDER_MESSAGES
from constants.order_statuses import ORDER_STATUSES
from constants.roles import ROLES
from modules.customer import customer_service
from modules.order import order_service
from modules.order.order_validator import (
    CreateOrderSchema,
    UpdateOrderSchema,
    UpdateOrderStatusSchema,
)
from utils.api_error import ApiError
from utils.api_response import ApiResponse


def create(
    payload: CreateOrderSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = request.state.user
    caller_role = current_user.get("role")
    caller_id = UUID(current_user["user_id"])

    if caller_role == ROLES.CUSTOMER or payload.customer_id is None:
        customer = customer_service.get_or_create_by_user_id(db, caller_id)
        customer_id = customer.id
    else:
        customer_id = payload.customer_id

    new_order = order_service.create(
        db=db,
        customer_id=customer_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        recipient_name=payload.recipient_name,
        recipient_phone=payload.recipient_phone,
        shipping_address=payload.shipping_address,
        subtotal=payload.subtotal,
        discount_amount=payload.discount_amount,
        shipping_fee=payload.shipping_fee,
        total_amount=payload.total_amount,
        order_number=payload.order_number,
        note=payload.note,
        coupon_code=payload.coupon_code,
    )

    return ApiResponse.created(
        data=new_order,
        message=ORDER_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    status: ORDER_STATUSES | None = Query(default=None),
    customer_id: UUID | None = Query(default=None),
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    min_total: Decimal | None = Query(default=None, ge=0),
    max_total: Decimal | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    filters = {}
    if status is not None:
        filters["status"] = status
    if customer_id is not None:
        filters["customer_id"] = customer_id

    result = order_service.get_all(
        db=db,
        filters=filters,
        search=search,
        start_date=start_date,
        end_date=end_date,
        min_total=min_total,
        max_total=max_total,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def get_my_orders(
    request: Request,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    status: ORDER_STATUSES | None = Query(default=None),
    db: Session = Depends(get_db),
):
    customer = customer_service.get_or_create_by_user_id(
        db, UUID(request.state.user["user_id"])
    )
    status_str = status.value if status else None

    result = order_service.get_my_orders(
        db=db,
        customer_id=customer.id,
        status=status_str,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def get_by_id(
    order_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    order = order_service.get_by_id(db=db, order_id=order_id)
    current_user = request.state.user

    if current_user.get("role") == ROLES.CUSTOMER:
        caller_id = UUID(current_user["user_id"])
        customer = customer_service.get_or_create_by_user_id(db, caller_id)
        if order.customer_id != customer.id:
            raise ApiError(403, ORDER_MESSAGES["FORBIDDEN"])

    return ApiResponse.success(data=order)


def get_by_order_number(
    order_number: str,
    request: Request,
    db: Session = Depends(get_db),
):
    order = order_service.get_by_order_number(db=db, order_number=order_number)
    current_user = request.state.user

    if current_user.get("role") == ROLES.CUSTOMER:
        caller_id = UUID(current_user["user_id"])
        customer = customer_service.get_or_create_by_user_id(db, caller_id)
        if order.customer_id != customer.id:
            raise ApiError(403, ORDER_MESSAGES["FORBIDDEN"])

    return ApiResponse.success(data=order)


def update_status(
    order_id: UUID,
    payload: UpdateOrderStatusSchema,
    db: Session = Depends(get_db),
):
    updated_order = order_service.update_status(
        db=db,
        order_id=order_id,
        new_status=payload.status,
        note=payload.note,
    )

    return ApiResponse.success(
        data=updated_order,
        message=ORDER_MESSAGES["STATUS_UPDATED"],
    )


def cancel(
    order_id: UUID,
    request: Request,
    payload: UpdateOrderStatusSchema | None = None,
    db: Session = Depends(get_db),
):
    order = order_service.get_by_id(db=db, order_id=order_id)
    current_user = request.state.user

    if current_user.get("role") == ROLES.CUSTOMER:
        caller_id = UUID(current_user["user_id"])
        customer = customer_service.get_or_create_by_user_id(db, caller_id)
        if order.customer_id != customer.id:
            raise ApiError(403, ORDER_MESSAGES["FORBIDDEN"])
        if order.status != ORDER_STATUSES.PENDING:
            raise ApiError(
                400,
                "Chỉ có thể hủy đơn hàng khi đơn đang ở trạng thái chờ xử lý (PENDING)",
            )

    note = payload.note if payload else "Khách hàng/Quản trị viên yêu cầu hủy đơn"
    cancelled_order = order_service.cancel(
        db=db,
        order_id=order_id,
        note=note,
    )

    return ApiResponse.success(
        data=cancelled_order,
        message=ORDER_MESSAGES["CANCELLED"],
    )


def update_shipping_info(
    order_id: UUID,
    payload: UpdateOrderSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    order = order_service.get_by_id(db=db, order_id=order_id)
    current_user = request.state.user

    if current_user.get("role") == ROLES.CUSTOMER:
        caller_id = UUID(current_user["user_id"])
        customer = customer_service.get_or_create_by_user_id(db, caller_id)
        if order.customer_id != customer.id:
            raise ApiError(403, ORDER_MESSAGES["FORBIDDEN"])
        if order.status != ORDER_STATUSES.PENDING:
            raise ApiError(400, ORDER_MESSAGES["CANNOT_UPDATE_SHIPPED_ORDER"])

    updated_order = order_service.update_shipping_info(
        db=db,
        order_id=order_id,
        recipient_name=payload.recipient_name,
        recipient_phone=payload.recipient_phone,
        shipping_address=payload.shipping_address,
        note=payload.note,
    )

    return ApiResponse.success(
        data=updated_order,
        message=ORDER_MESSAGES["UPDATED"],
    )
