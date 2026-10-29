from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from modules.payment.payment import Payment


def create(db: Session, payment_data: dict) -> Payment:
    payment = Payment(**payment_data)
    db.add(payment)
    db.flush()
    db.refresh(payment)
    return payment


def find_by_id(db: Session, payment_id: UUID) -> Payment | None:
    return db.get(Payment, payment_id)


def find_by_order_id(db: Session, order_id: UUID) -> Payment | None:
    query = select(Payment).where(Payment.order_id == order_id)
    return db.scalar(query)


def update(db: Session, payment: Payment, payment_data: dict) -> Payment:
    for key, value in payment_data.items():
        setattr(payment, key, value)

    db.flush()
    db.refresh(payment)
    return payment


def find_all(
    db: Session,
    filter_data: dict | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Payment]:
    query = select(Payment)

    if filter_data:
        query = query.filter_by(**filter_data)

    query = query.order_by(desc(Payment.created_at)).offset(skip).limit(limit)
    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter_data: dict | None = None,
) -> int:
    query = select(func.count(Payment.id)).select_from(Payment)

    if filter_data:
        query = query.filter_by(**filter_data)

    return db.scalar(query) or 0
