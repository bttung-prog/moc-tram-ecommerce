from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from constants.order_statuses import ORDER_STATUSES
from constants.payments import PAYMENT_STATUSES
from constants.product_statuses import PRODUCT_STATUSES
from modules.customer.customer import Customer
from modules.order.order import Order
from modules.payment.payment import Payment
from modules.product.product import Product


def get_summary(db: Session, start_at: datetime, end_at: datetime) -> dict:
    query = select(
        select(func.count(Order.id)).scalar_subquery().label("total_orders"),
        select(func.count(Order.id))
        .where(Order.created_at >= start_at, Order.created_at < end_at)
        .scalar_subquery()
        .label("orders_in_period"),
        select(func.count(Order.id))
        .where(Order.status == ORDER_STATUSES.PENDING)
        .scalar_subquery()
        .label("pending_orders"),
        select(func.count(Customer.id))
        .where(Customer.is_active.is_(True), Customer.deleted_at.is_(None))
        .scalar_subquery()
        .label("active_customers"),
        select(func.count(Product.id))
        .where(Product.status == PRODUCT_STATUSES.ACTIVE)
        .scalar_subquery()
        .label("active_products"),
        select(func.coalesce(func.sum(Payment.amount), Decimal("0.00")))
        .where(Payment.status == PAYMENT_STATUSES.SUCCESS)
        .scalar_subquery()
        .label("total_revenue"),
        select(func.coalesce(func.sum(Payment.amount), Decimal("0.00")))
        .where(
            Payment.status == PAYMENT_STATUSES.SUCCESS,
            Payment.paid_at >= start_at,
            Payment.paid_at < end_at,
        )
        .scalar_subquery()
        .label("revenue_in_period"),
    )
    return dict(db.execute(query).mappings().one())


def get_revenue_by_day(
    db: Session,
    start_at: datetime,
    end_at: datetime,
) -> list[tuple[object, Decimal]]:
    day = func.date(Payment.paid_at)
    query = (
        select(day, func.sum(Payment.amount))
        .where(
            Payment.status == PAYMENT_STATUSES.SUCCESS,
            Payment.paid_at >= start_at,
            Payment.paid_at < end_at,
        )
        .group_by(day)
        .order_by(day)
    )
    return list(db.execute(query).tuples().all())


def get_order_status_counts(db: Session) -> dict[str, int]:
    query = select(Order.status, func.count(Order.id)).group_by(Order.status)
    return {
        status.value if hasattr(status, "value") else status: count
        for status, count in db.execute(query).tuples()
    }


def get_recent_orders(db: Session, limit: int = 5) -> list[Order]:
    query = select(Order).order_by(Order.created_at.desc()).limit(limit)
    return list(db.scalars(query).all())


def get_top_products(
    db: Session,
    start_at: datetime,
    end_at: datetime,
    limit: int = 5,
) -> list[dict]:
    query = (
        select(
            Product.id.label("product_id"),
            Product.name.label("product_name"),
            func.sum(Order.quantity).label("quantity_sold"),
            func.sum(Order.total_amount).label("revenue"),
        )
        .join(Order, Order.product_id == Product.id)
        .where(
            Order.created_at >= start_at,
            Order.created_at < end_at,
            Order.status != ORDER_STATUSES.CANCELLED,
        )
        .group_by(Product.id, Product.name)
        .order_by(func.sum(Order.quantity).desc())
        .limit(limit)
    )
    return [dict(row) for row in db.execute(query).mappings()]
