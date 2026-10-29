from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from constants.user_statuses import USER_STATUSES
from modules.staff.staff import Staff
from modules.user.user import User


def create(db: Session, staff_data: dict) -> Staff:
    new_staff = Staff(**staff_data)

    db.add(new_staff)
    db.flush()
    db.refresh(new_staff)

    return new_staff


def find_by_id(db: Session, staff_id: UUID) -> Staff | None:
    return db.get(Staff, staff_id)


def find_by_user_id(db: Session, user_id: UUID) -> Staff | None:
    query = select(Staff).where(Staff.user_id == user_id)
    return db.scalar(query)


def find_by_staff_code(db: Session, staff_code: str) -> Staff | None:
    query = select(Staff).where(Staff.staff_code == staff_code.strip())
    return db.scalar(query)


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Staff]:
    query = select(Staff).join(User, Staff.user_id == User.id)

    if filter:
        for k, v in filter.items():
            if hasattr(Staff, k) and v is not None:
                query = query.where(getattr(Staff, k) == v)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
                Staff.staff_code.ilike(search_term),
            )
        )

    query = query.order_by(desc(Staff.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
) -> int:
    query = select(func.count(Staff.id)).select_from(Staff)

    if search:
        query = query.join(User, Staff.user_id == User.id)
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
                Staff.staff_code.ilike(search_term),
            )
        )

    if filter:
        for k, v in filter.items():
            if hasattr(Staff, k) and v is not None:
                query = query.where(getattr(Staff, k) == v)

    return db.scalar(query) or 0


def update_by_id(
    db: Session,
    staff_id: UUID,
    staff_data: dict,
) -> Staff | None:
    staff = find_by_id(db, staff_id)
    if not staff:
        return None

    for k, v in staff_data.items():
        setattr(staff, k, v)

    db.flush()
    db.refresh(staff)

    return staff


def delete_by_id(
    db: Session,
    staff_id: UUID,
) -> bool:
    staff = find_by_id(db, staff_id)
    if not staff:
        return False

    staff.is_active = False
    staff.deleted_at = datetime.now(UTC)
    if staff.user:
        staff.user.status = USER_STATUSES.INACTIVE

    db.flush()
    return True


def restore_by_id(
    db: Session,
    staff_id: UUID,
) -> Staff | None:
    staff = find_by_id(db, staff_id)
    if not staff or staff.is_active:
        return None

    staff.is_active = True
    staff.deleted_at = None
    if staff.user:
        staff.user.status = USER_STATUSES.ACTIVE

    db.flush()
    db.refresh(staff)
    return staff
