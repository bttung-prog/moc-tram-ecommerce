from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from modules.order.order import Order


def create(
    db: Session,
    order_data: dict,
) -> Order:
    new_order = Order(**order_data)

    db.add(new_order)
    db.flush()
    db.refresh(new_order)

    return new_order


def find_by_id(db: Session, order_id: UUID) -> Order | None:
    return db.get(Order, order_id)


def find_by_order_number(db: Session, order_number: str) -> Order | None:
    query = select(Order).where(Order.order_number == order_number)
    return db.scalar(query)


def exists_by_order_number(db: Session, order_number: str) -> bool:
    query = select(func.count(Order.id)).where(Order.order_number == order_number)
    return (db.scalar(query) or 0) > 0


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    min_total: Decimal | None = None,
    max_total: Decimal | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Order]:
    query = select(Order)

    if filter:
        for k, v in filter.items():
            if hasattr(Order, k) and v is not None:
                query = query.where(getattr(Order, k) == v)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Order.order_number.ilike(search_term),
                Order.recipient_name.ilike(search_term),
                Order.recipient_phone.ilike(search_term),
            )
        )

    if start_date is not None:
        query = query.where(Order.created_at >= start_date)
    if end_date is not None:
        query = query.where(Order.created_at <= end_date)

    if min_total is not None:
        query = query.where(Order.total_amount >= min_total)
    if max_total is not None:
        query = query.where(Order.total_amount <= max_total)

    query = query.order_by(desc(Order.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    min_total: Decimal | None = None,
    max_total: Decimal | None = None,
) -> int:
    query = select(func.count(Order.id)).select_from(Order)

    if filter:
        for k, v in filter.items():
            if hasattr(Order, k) and v is not None:
                query = query.where(getattr(Order, k) == v)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Order.order_number.ilike(search_term),
                Order.recipient_name.ilike(search_term),
                Order.recipient_phone.ilike(search_term),
            )
        )

    if start_date is not None:
        query = query.where(Order.created_at >= start_date)
    if end_date is not None:
        query = query.where(Order.created_at <= end_date)

    if min_total is not None:
        query = query.where(Order.total_amount >= min_total)
    if max_total is not None:
        query = query.where(Order.total_amount <= max_total)

    return db.scalar(query) or 0


def find_by_customer_id(
    db: Session,
    customer_id: UUID,
    status: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Order]:
    query = select(Order).where(Order.customer_id == customer_id)
    if status is not None:
        query = query.where(Order.status == status)

    query = query.order_by(desc(Order.created_at)).offset(skip).limit(limit)
    return list(db.scalars(query).all())


def count_by_customer_id(
    db: Session,
    customer_id: UUID,
    status: str | None = None,
) -> int:
    query = select(func.count(Order.id)).where(Order.customer_id == customer_id)
    if status is not None:
        query = query.where(Order.status == status)

    return db.scalar(query) or 0


def update_by_id(
    db: Session,
    order_id: UUID,
    order_data: dict,
) -> Order | None:
    order = find_by_id(db, order_id)
    if not order:
        return None

    for k, v in order_data.items():
        setattr(order, k, v)

    db.flush()
    db.refresh(order)

    return order
