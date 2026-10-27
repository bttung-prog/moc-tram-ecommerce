from datetime import datetime
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from modules.feedback.feedback import Feedback


def create(db: Session, feedback_data: dict) -> Feedback:
    new_feedback = Feedback(**feedback_data)
    db.add(new_feedback)
    db.flush()
    db.refresh(new_feedback)
    return new_feedback


def find_by_id(db: Session, feedback_id: UUID) -> Feedback | None:
    return db.get(Feedback, feedback_id)


def find_by_order_id(db: Session, order_id: UUID) -> Feedback | None:
    query = select(Feedback).where(Feedback.order_id == order_id)
    return db.scalar(query)


def exists_by_order_id(db: Session, order_id: UUID) -> bool:
    query = select(func.count(Feedback.id)).where(Feedback.order_id == order_id)
    return (db.scalar(query) or 0) > 0


def find_by_customer_id(
    db: Session,
    customer_id: UUID,
    skip: int = 0,
    limit: int = 10,
) -> list[Feedback]:
    query = (
        select(Feedback)
        .where(Feedback.customer_id == customer_id)
        .order_by(desc(Feedback.created_at))
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(query).all())


def count_by_customer_id(db: Session, customer_id: UUID) -> int:
    query = select(func.count(Feedback.id)).where(Feedback.customer_id == customer_id)
    return db.scalar(query) or 0


def find_all(
    db: Session,
    filter: dict | None = None,
    rating: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Feedback]:
    query = select(Feedback)

    if filter:
        for k, v in filter.items():
            if hasattr(Feedback, k) and v is not None:
                query = query.where(getattr(Feedback, k) == v)

    if rating is not None:
        query = query.where(Feedback.rating == rating)

    if start_date is not None:
        query = query.where(Feedback.created_at >= start_date)
    if end_date is not None:
        query = query.where(Feedback.created_at <= end_date)

    query = query.order_by(desc(Feedback.created_at)).offset(skip).limit(limit)
    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    rating: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> int:
    query = select(func.count(Feedback.id)).select_from(Feedback)

    if filter:
        for k, v in filter.items():
            if hasattr(Feedback, k) and v is not None:
                query = query.where(getattr(Feedback, k) == v)

    if rating is not None:
        query = query.where(Feedback.rating == rating)

    if start_date is not None:
        query = query.where(Feedback.created_at >= start_date)
    if end_date is not None:
        query = query.where(Feedback.created_at <= end_date)

    return db.scalar(query) or 0


def update_by_id(
    db: Session,
    feedback_id: UUID,
    update_data: dict,
) -> Feedback | None:
    feedback = find_by_id(db, feedback_id)
    if not feedback:
        return None

    for k, v in update_data.items():
        setattr(feedback, k, v)

    db.flush()
    db.refresh(feedback)
    return feedback


def delete_by_id(db: Session, feedback_id: UUID) -> bool:
    feedback = find_by_id(db, feedback_id)
    if not feedback:
        return False

    db.delete(feedback)
    db.flush()
    return True
