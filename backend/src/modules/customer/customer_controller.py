from decimal import Decimal
from uuid import UUID

from fastapi import Depends, Query, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.genders import GENDERS
from constants.messages import CUSTOMER_MESSAGES
from modules.customer import customer_service
from modules.customer.customer_validator import (
    AdjustLoyaltyPointsSchema,
    CreateCustomerSchema,
    UpdateCustomerMeSchema,
    UpdateCustomerSchema,
)
from utils.api_response import ApiResponse


def create(
    payload: CreateCustomerSchema,
    db: Session = Depends(get_db),
):
    new_customer = customer_service.create(
        db=db,
        user_id=payload.user_id,
        gender=payload.gender,
        loyalty_points=payload.loyalty_points,
        total_spent=payload.total_spent,
        total_orders=payload.total_orders,
    )

    return ApiResponse.created(
        data=new_customer,
        message=CUSTOMER_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    gender: GENDERS | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    min_points: int | None = Query(default=None, ge=0),
    max_points: int | None = Query(default=None, ge=0),
    min_spent: Decimal | None = Query(default=None, ge=0),
    max_spent: Decimal | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    filters = {}
    if gender is not None:
        filters["gender"] = gender
    if is_active is not None:
        filters["is_active"] = is_active

    result = customer_service.get_all(
        db=db,
        filters=filters,
        search=search,
        min_points=min_points,
        max_points=max_points,
        min_spent=min_spent,
        max_spent=max_spent,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def get_me(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    customer = customer_service.get_or_create_by_user_id(db, user_id)

    return ApiResponse.success(
        data=customer,
    )


def update_me(
    request: Request,
    payload: UpdateCustomerMeSchema,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    updated_customer = customer_service.update_me(
        db=db,
        user_id=user_id,
        gender=payload.gender,
    )

    return ApiResponse.success(
        data=updated_customer,
        message=CUSTOMER_MESSAGES["UPDATED"],
    )


def get_by_id(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    customer = customer_service.get_by_id(
        db=db,
        customer_id=customer_id,
    )

    return ApiResponse.success(
        data=customer,
    )


def get_by_user_id(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    customer = customer_service.get_by_user_id(
        db=db,
        user_id=user_id,
    )

    return ApiResponse.success(
        data=customer,
    )


def update(
    customer_id: UUID,
    payload: UpdateCustomerSchema,
    db: Session = Depends(get_db),
):
    updated_customer = customer_service.update(
        db=db,
        customer_id=customer_id,
        gender=payload.gender,
        loyalty_points=payload.loyalty_points,
        total_spent=payload.total_spent,
        total_orders=payload.total_orders,
    )

    return ApiResponse.success(
        data=updated_customer,
        message=CUSTOMER_MESSAGES["UPDATED"],
    )


def adjust_loyalty_points(
    customer_id: UUID,
    payload: AdjustLoyaltyPointsSchema,
    db: Session = Depends(get_db),
):
    updated_customer = customer_service.adjust_loyalty_points(
        db=db,
        customer_id=customer_id,
        delta=payload.delta,
    )

    return ApiResponse.success(
        data=updated_customer,
        message="Cập nhật điểm tích lũy thành công",
    )


def delete(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    customer_service.delete(
        db=db,
        customer_id=customer_id,
    )

    return ApiResponse.success(
        message=CUSTOMER_MESSAGES["DELETED"],
    )


def restore(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    restored_customer = customer_service.restore(
        db=db,
        customer_id=customer_id,
    )

    return ApiResponse.success(
        data=restored_customer,
        message=CUSTOMER_MESSAGES["RESTORED"],
    )
