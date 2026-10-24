from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from modules.coupon.coupon import Coupon

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
