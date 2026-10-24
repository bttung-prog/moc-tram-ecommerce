from uuid import UUID

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.discount_types import DiscountType
from constants.messages import COUPON_MESSAGES
from modules.coupon import coupon_service
from modules.coupon.coupon_validator import (
    CreateCouponSchema,
    UpdateCouponSchema,
)
from utils.api_response import ApiResponse


def create(
    payload: CreateCouponSchema,
    db: Session = Depends(get_db),
):
    new_coupon = coupon_service.create(
        db=db,
        code=payload.code,
        description=payload.description,
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        max_discount_amount=payload.max_discount_amount,
        min_order_amount=payload.min_order_amount,
        usage_limit=payload.usage_limit,
        usage_limit_per_user=payload.usage_limit_per_user,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )

    return ApiResponse.created(
        data=new_coupon,
        message=COUPON_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    is_active: bool | None = Query(default=None),
    discount_type: DiscountType | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if is_active is not None:
        filters["is_active"] = is_active
    if discount_type is not None:
        filters["discount_type"] = discount_type

    result = coupon_service.get_all(
        db=db,
        filters=filters,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def get_by_id(
    coupon_id: UUID,
    db: Session = Depends(get_db),
):
    coupon = coupon_service.get_by_id(db, coupon_id)

    return ApiResponse.success(
        data=coupon,
    )


def get_by_code(
    code: str,
    db: Session = Depends(get_db),
):
    coupon = coupon_service.get_by_code(db, code)

    return ApiResponse.success(
        data=coupon,
    )


def update(
    coupon_id: UUID,
    payload: UpdateCouponSchema,
    db: Session = Depends(get_db),
):
    updated_coupon = coupon_service.update(
        db=db,
        coupon_id=coupon_id,
        code=payload.code,
        description=payload.description,
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        max_discount_amount=payload.max_discount_amount,
        min_order_amount=payload.min_order_amount,
        usage_limit=payload.usage_limit,
        usage_limit_per_user=payload.usage_limit_per_user,
        start_date=payload.start_date,
        end_date=payload.end_date,
        is_active=payload.is_active,
    )

    return ApiResponse.success(
        data=updated_coupon,
        message=COUPON_MESSAGES["UPDATED"],
    )


def delete_by_id(
    coupon_id: UUID,
    db: Session = Depends(get_db),
):
    coupon_service.delete_by_id(db, coupon_id)

    return ApiResponse.success(
        message=COUPON_MESSAGES["DELETED"],
    )


def delete_by_code(
    code: str,
    db: Session = Depends(get_db),
):
    coupon_service.delete_by_code(db, code)

    return ApiResponse.success(
        message=COUPON_MESSAGES["DELETED"],
    )
