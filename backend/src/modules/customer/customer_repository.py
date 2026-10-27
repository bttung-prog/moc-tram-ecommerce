from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from constants.user_statuses import USER_STATUSES
from modules.customer.customer import Customer
from modules.user.user import User


def create(db: Session, customer_data: dict) -> Customer:
    new_customer = Customer(**customer_data)

    db.add(new_customer)
    db.flush()
    db.refresh(new_customer)

    return new_customer


def find_by_id(db: Session, customer_id: UUID) -> Customer | None:
    return db.get(Customer, customer_id)


def find_by_user_id(db: Session, user_id: UUID) -> Customer | None:
    query = select(Customer).where(Customer.user_id == user_id)
    return db.scalar(query)


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    min_points: int | None = None,
    max_points: int | None = None,
    min_spent: Decimal | None = None,
    max_spent: Decimal | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Customer]:
    query = select(Customer).join(User, Customer.user_id == User.id)

    if filter:
        for k, v in filter.items():
            if hasattr(Customer, k) and v is not None:
                query = query.where(getattr(Customer, k) == v)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
            )
        )

    if min_points is not None:
        query = query.where(Customer.loyalty_points >= min_points)
    if max_points is not None:
        query = query.where(Customer.loyalty_points <= max_points)

    if min_spent is not None:
        query = query.where(Customer.total_spent >= min_spent)
    if max_spent is not None:
        query = query.where(Customer.total_spent <= max_spent)

    query = query.order_by(desc(Customer.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    min_points: int | None = None,
    max_points: int | None = None,
    min_spent: Decimal | None = None,
    max_spent: Decimal | None = None,
) -> int:
    query = select(func.count(Customer.id)).select_from(Customer)

    if search:
        query = query.join(User, Customer.user_id == User.id)
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
            )
        )

    if filter:
        for k, v in filter.items():
            if hasattr(Customer, k) and v is not None:
                query = query.where(getattr(Customer, k) == v)

    if min_points is not None:
        query = query.where(Customer.loyalty_points >= min_points)
    if max_points is not None:
        query = query.where(Customer.loyalty_points <= max_points)

    if min_spent is not None:
        query = query.where(Customer.total_spent >= min_spent)
    if max_spent is not None:
        query = query.where(Customer.total_spent <= max_spent)

    return db.scalar(query) or 0


def update_by_id(
    db: Session,
    customer_id: UUID,
    customer_data: dict,
) -> Customer | None:
    customer = find_by_id(db, customer_id)
    if not customer:
        return None

    for k, v in customer_data.items():
        setattr(customer, k, v)

    db.flush()
    db.refresh(customer)

    return customer


def delete_by_id(
    db: Session,
    customer_id: UUID,
) -> bool:
    customer = find_by_id(db, customer_id)
    if not customer:
        return False

    customer.is_active = False
    customer.deleted_at = datetime.now(UTC)
    if customer.user:
        customer.user.status = USER_STATUSES.INACTIVE

    db.flush()
    return True


def restore_by_id(
    db: Session,
    customer_id: UUID,
) -> Customer | None:
    customer = find_by_id(db, customer_id)
    if not customer or customer.is_active:
        return None

    customer.is_active = True
    customer.deleted_at = None
    if customer.user:
        customer.user.status = USER_STATUSES.ACTIVE

    db.flush()
    db.refresh(customer)
    return customer
