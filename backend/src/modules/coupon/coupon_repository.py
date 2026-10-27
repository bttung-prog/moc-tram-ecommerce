from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from modules.coupon.coupon import Coupon
from modules.coupon.coupon_usage import CouponUsage

# ==========================================
# Coupon CRUD
# ==========================================


def create(db: Session, coupon_data: dict) -> Coupon:
    new_coupon = Coupon(**coupon_data)

    db.add(new_coupon)
    db.flush()
    db.refresh(new_coupon)

    return new_coupon


def find_by_id(db: Session, coupon_id: UUID) -> Coupon | None:
    return db.get(Coupon, coupon_id)


def find_by_code(db: Session, code: str) -> Coupon | None:
    query = select(Coupon).where(Coupon.code == code)
    return db.scalar(query)


def find_all(
    db: Session,
    filter: dict | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Coupon]:
    query = select(Coupon)

    if filter:
        query = query.filter_by(**filter)

    query = query.order_by(desc(Coupon.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
) -> int:
    query = select(func.count(Coupon.id)).select_from(Coupon)

    if filter:
        query = query.filter_by(**filter)

    return db.scalar(query) or 0


def update_by_id(db: Session, coupon_id: UUID, coupon_data: dict) -> Coupon | None:
    coupon = db.get(Coupon, coupon_id)

    if not coupon:
        return None

    for k, v in coupon_data.items():
        setattr(coupon, k, v)

    db.flush()
    db.refresh(coupon)

    return coupon


def update_by_code(db: Session, code: str, coupon_data: dict) -> Coupon | None:
    coupon = find_by_code(db, code)

    if not coupon:
        return None

    for k, v in coupon_data.items():
        setattr(coupon, k, v)

    db.flush()
    db.refresh(coupon)

    return coupon


def delete_by_id(db: Session, coupon_id: UUID) -> bool:
    coupon = db.get(Coupon, coupon_id)

    if not coupon:
        return False

    db.delete(coupon)
    db.flush()

    return True


def delete_by_code(db: Session, code: str) -> bool:
    coupon = find_by_code(db, code)

    if not coupon:
        return False

    db.delete(coupon)
    db.flush()

    return True


def adjust_used_count(db: Session, coupon_id: UUID, delta: int) -> Coupon | None:
    coupon = find_by_id(db, coupon_id)
    if not coupon:
        return None

    coupon.used_count = max(0, coupon.used_count + delta)
    db.flush()
    db.refresh(coupon)
    return coupon


# ==========================================
# CouponUsage Operations
# ==========================================


def create_usage(db: Session, usage_data: dict) -> CouponUsage:
    usage = CouponUsage(**usage_data)
    db.add(usage)
    db.flush()
    db.refresh(usage)
    return usage


def find_usage_by_order_id(db: Session, order_id: UUID) -> CouponUsage | None:
    query = select(CouponUsage).where(CouponUsage.order_id == order_id)
    return db.scalar(query)


def count_user_usages(db: Session, coupon_id: UUID, user_id: UUID) -> int:
    query = (
        select(func.count(CouponUsage.id))
        .where(CouponUsage.coupon_id == coupon_id)
        .where(CouponUsage.user_id == user_id)
    )
    return db.scalar(query) or 0


def delete_usage_by_order_id(db: Session, order_id: UUID) -> bool:
    usage = find_usage_by_order_id(db, order_id)
    if not usage:
        return False

    db.delete(usage)
    db.flush()
    return True
