from uuid import UUID

from fastapi import Depends, Query, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import PAYMENT_MESSAGES
from constants.payments import PAYMENT_STATUSES
from modules.payment import payment_service
from modules.payment.payment_validator import (
    CreatePaymentSchema,
    UpdatePaymentStatusSchema,
)
from utils.api_response import ApiResponse


def create(
    payload: CreatePaymentSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = request.state.user
    caller_role = current_user.get("role")
    caller_id = UUID(current_user["user_id"])

    payment = payment_service.create_or_get_payment(
        db=db,
        order_id=payload.order_id,
        current_user_id=caller_id,
        role=caller_role,
    )

    bank_info = payment_service.get_bank_config()

    return ApiResponse.created(
        data={
            "payment": payment,
            "bank_info": bank_info,
        },
        message=PAYMENT_MESSAGES["CREATED"],
    )


def get_by_order_id(
    order_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = request.state.user
    caller_role = current_user.get("role")
    caller_id = UUID(current_user["user_id"])

    payment = payment_service.get_by_order_id(
        db=db,
        order_id=order_id,
        current_user_id=caller_id,
        role=caller_role,
    )

    bank_info = payment_service.get_bank_config()

    return ApiResponse.success(
        data={
            "payment": payment,
            "bank_info": bank_info,
        },
        message=PAYMENT_MESSAGES["GET_SUCCESS"],
    )


def get_by_id(
    payment_id: UUID,
    db: Session = Depends(get_db),
):
    payment = payment_service.get_by_id(db=db, payment_id=payment_id)
    bank_info = payment_service.get_bank_config()

    return ApiResponse.success(
        data={
            "payment": payment,
            "bank_info": bank_info,
        },
        message=PAYMENT_MESSAGES["GET_SUCCESS"],
    )


def confirm_payment(
    payment_id: UUID,
    payload: UpdatePaymentStatusSchema,
    db: Session = Depends(get_db),
):
    updated_payment = payment_service.confirm_payment(
        db=db,
        payment_id=payment_id,
        transaction_id=payload.transaction_id,
        note=payload.note,
    )

    return ApiResponse.success(
        data=updated_payment,
        message=PAYMENT_MESSAGES["CONFIRMED"],
    )


def simulate_payment(
    order_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = request.state.user
    caller_role = current_user.get("role")
    caller_id = UUID(current_user["user_id"])

    payment = payment_service.simulate_payment(
        db=db,
        order_id=order_id,
        current_user_id=caller_id,
        role=caller_role,
    )

    return ApiResponse.success(
        data=payment,
        message=PAYMENT_MESSAGES["SIMULATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    status: PAYMENT_STATUSES | None = Query(default=None),
    db: Session = Depends(get_db),
):
    result = payment_service.get_all(
        db=db,
        status=status,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )
