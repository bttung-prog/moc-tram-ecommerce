import math
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import FEEDBACK_MESSAGES
from constants.order_statuses import ORDER_STATUSES
from modules.feedback import feedback_repository
from modules.feedback.feedback import Feedback
from modules.order import order_service
from utils.api_error import ApiError


def create(
    db: Session,
    customer_id: UUID,
    order_id: UUID,
    rating: int,
    comment: str,
) -> Feedback:
    order = order_service.get_by_id(db, order_id)

    if order.customer_id != customer_id:
        raise ApiError(403, FEEDBACK_MESSAGES["FORBIDDEN"])

    if order.status != ORDER_STATUSES.DELIVERED:
        raise ApiError(400, FEEDBACK_MESSAGES["ORDER_NOT_DELIVERED"])

    if feedback_repository.exists_by_order_id(db, order_id):
        raise ApiError(400, FEEDBACK_MESSAGES["ALREADY_EXISTS"])

    if rating < 1 or rating > 5:
        raise ApiError(400, FEEDBACK_MESSAGES["INVALID_RATING"])

    clean_comment = comment.strip()
    if not clean_comment:
        raise ApiError(400, FEEDBACK_MESSAGES["COMMENT_REQUIRED"])

    new_feedback = feedback_repository.create(
        db=db,
        feedback_data={
            "order_id": order_id,
            "customer_id": customer_id,
            "rating": rating,
            "comment": clean_comment,
        },
    )

    return new_feedback


def get_by_id(db: Session, feedback_id: UUID) -> Feedback:
    feedback = feedback_repository.find_by_id(db, feedback_id)
    if not feedback:
        raise ApiError(404, FEEDBACK_MESSAGES["NOT_FOUND"])
    return feedback


def get_by_order_id(db: Session, order_id: UUID) -> Feedback:
    feedback = feedback_repository.find_by_order_id(db, order_id)
    if not feedback:
        raise ApiError(404, FEEDBACK_MESSAGES["NOT_FOUND"])
    return feedback


def get_my_feedbacks(
    db: Session,
    customer_id: UUID,
    page: int = 1,
    limit: int = 10,
) -> dict:
    page_number = max(1, int(page))
    limit_number = max(1, int(limit))
    skip = (page_number - 1) * limit_number

    feedbacks = feedback_repository.find_by_customer_id(
        db=db,
        customer_id=customer_id,
        skip=skip,
        limit=limit_number,
    )
    total_feedbacks = feedback_repository.count_by_customer_id(
        db=db,
        customer_id=customer_id,
    )

    return {
        "data": feedbacks,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_feedbacks,
            "total_pages": (
                math.ceil(total_feedbacks / limit_number) if total_feedbacks > 0 else 0
            ),
        },
    }


def get_all(
    db: Session,
    filters: dict | None = None,
    rating: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    if filters is None:
        filters = {}

    page_number = max(1, int(page))
    limit_number = max(1, int(limit))
    skip = (page_number - 1) * limit_number

    feedbacks = feedback_repository.find_all(
        db=db,
        filter=filters,
        rating=rating,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit_number,
    )
    total_feedbacks = feedback_repository.count_all(
        db=db,
        filter=filters,
        rating=rating,
        start_date=start_date,
        end_date=end_date,
    )

    return {
        "data": feedbacks,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_feedbacks,
            "total_pages": (
                math.ceil(total_feedbacks / limit_number) if total_feedbacks > 0 else 0
            ),
        },
    }


def update(
    db: Session,
    feedback_id: UUID,
    customer_id: UUID,
    rating: int | None = None,
    comment: str | None = None,
) -> Feedback:
    feedback = get_by_id(db, feedback_id)

    if feedback.customer_id != customer_id:
        raise ApiError(403, FEEDBACK_MESSAGES["FORBIDDEN"])

    update_data = {}
    if rating is not None:
        if rating < 1 or rating > 5:
            raise ApiError(400, FEEDBACK_MESSAGES["INVALID_RATING"])
        update_data["rating"] = rating

    if comment is not None:
        clean_comment = comment.strip()
        if not clean_comment:
            raise ApiError(400, FEEDBACK_MESSAGES["COMMENT_REQUIRED"])
        update_data["comment"] = clean_comment

    if not update_data:
        return feedback

    updated_feedback = feedback_repository.update_by_id(db, feedback_id, update_data)
    if not updated_feedback:
        raise ApiError(404, FEEDBACK_MESSAGES["NOT_FOUND"])

    return updated_feedback


def reply(
    db: Session,
    feedback_id: UUID,
    reply: str,
) -> Feedback:
    feedback = get_by_id(db, feedback_id)

    clean_reply = reply.strip()
    if not clean_reply:
        raise ApiError(400, FEEDBACK_MESSAGES["REPLY_REQUIRED"])

    updated_feedback = feedback_repository.update_by_id(
        db=db,
        feedback_id=feedback.id,
        update_data={
            "reply": clean_reply,
            "replied_at": datetime.now(UTC),
        },
    )
    if not updated_feedback:
        raise ApiError(404, FEEDBACK_MESSAGES["NOT_FOUND"])

    return updated_feedback
