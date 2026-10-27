from datetime import datetime
from uuid import UUID

from fastapi import Depends, Query, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import FEEDBACK_MESSAGES
from constants.roles import ROLES
from modules.customer import customer_service
from modules.feedback import feedback_service
from modules.feedback.feedback_validator import (
    CreateFeedbackSchema,
    ReplyFeedbackSchema,
    UpdateFeedbackSchema,
)
from utils.api_error import ApiError
from utils.api_response import ApiResponse


def create(
    payload: CreateFeedbackSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    caller_id = UUID(request.state.user["user_id"])
    customer = customer_service.get_or_create_by_user_id(db, caller_id)

    new_feedback = feedback_service.create(
        db=db,
        customer_id=customer.id,
        order_id=payload.order_id,
        rating=payload.rating,
        comment=payload.comment,
    )

    return ApiResponse.created(
        data=new_feedback,
        message=FEEDBACK_MESSAGES["CREATED"],
    )


def get_my_feedbacks(
    request: Request,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    caller_id = UUID(request.state.user["user_id"])
    customer = customer_service.get_or_create_by_user_id(db, caller_id)

    result = feedback_service.get_my_feedbacks(
        db=db,
        customer_id=customer.id,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def get_by_order_id(
    order_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    feedback = feedback_service.get_by_order_id(db=db, order_id=order_id)
    current_user = request.state.user

    if current_user.get("role") == ROLES.CUSTOMER:
        caller_id = UUID(current_user["user_id"])
        customer = customer_service.get_or_create_by_user_id(db, caller_id)
        if feedback.customer_id != customer.id:
            raise ApiError(403, FEEDBACK_MESSAGES["FORBIDDEN"])

    return ApiResponse.success(data=feedback)


def get_by_id(
    feedback_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    feedback = feedback_service.get_by_id(db=db, feedback_id=feedback_id)
    current_user = request.state.user

    if current_user.get("role") == ROLES.CUSTOMER:
        caller_id = UUID(current_user["user_id"])
        customer = customer_service.get_or_create_by_user_id(db, caller_id)
        if feedback.customer_id != customer.id:
            raise ApiError(403, FEEDBACK_MESSAGES["FORBIDDEN"])

    return ApiResponse.success(data=feedback)


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    rating: int | None = Query(default=None, ge=1, le=5),
    customer_id: UUID | None = Query(default=None),
    order_id: UUID | None = Query(default=None),
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if customer_id is not None:
        filters["customer_id"] = customer_id
    if order_id is not None:
        filters["order_id"] = order_id

    result = feedback_service.get_all(
        db=db,
        filters=filters,
        rating=rating,
        start_date=start_date,
        end_date=end_date,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def update(
    feedback_id: UUID,
    payload: UpdateFeedbackSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    caller_id = UUID(request.state.user["user_id"])
    customer = customer_service.get_or_create_by_user_id(db, caller_id)

    updated_feedback = feedback_service.update(
        db=db,
        feedback_id=feedback_id,
        customer_id=customer.id,
        rating=payload.rating,
        comment=payload.comment,
    )

    return ApiResponse.success(
        data=updated_feedback,
        message=FEEDBACK_MESSAGES["UPDATED"],
    )


def reply(
    feedback_id: UUID,
    payload: ReplyFeedbackSchema,
    db: Session = Depends(get_db),
):
    updated_feedback = feedback_service.reply(
        db=db,
        feedback_id=feedback_id,
        reply=payload.reply,
    )

    return ApiResponse.success(
        data=updated_feedback,
        message=FEEDBACK_MESSAGES["REPLIED"],
    )
