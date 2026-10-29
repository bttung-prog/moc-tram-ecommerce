from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from constants.user_statuses import USER_STATUSES
from modules.user.user import User
from modules.warehouse_staff.warehouse_staff import WarehouseStaff


def create(db: Session, warehouse_staff_data: dict) -> WarehouseStaff:
    new_warehouse_staff = WarehouseStaff(**warehouse_staff_data)

    db.add(new_warehouse_staff)
    db.flush()
    db.refresh(new_warehouse_staff)

    return new_warehouse_staff


def find_by_id(db: Session, warehouse_staff_id: UUID) -> WarehouseStaff | None:
    return db.get(WarehouseStaff, warehouse_staff_id)


def find_by_user_id(db: Session, user_id: UUID) -> WarehouseStaff | None:
    query = select(WarehouseStaff).where(WarehouseStaff.user_id == user_id)
    return db.scalar(query)


def find_by_staff_code(db: Session, staff_code: str) -> WarehouseStaff | None:
    query = select(WarehouseStaff).where(
        WarehouseStaff.staff_code == staff_code.strip()
    )
    return db.scalar(query)


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[WarehouseStaff]:
    query = select(WarehouseStaff).join(User, WarehouseStaff.user_id == User.id)

    if filter:
        for k, v in filter.items():
            if hasattr(WarehouseStaff, k) and v is not None:
                query = query.where(getattr(WarehouseStaff, k) == v)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
                WarehouseStaff.staff_code.ilike(search_term),
            )
        )

    query = query.order_by(desc(WarehouseStaff.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
) -> int:
    query = select(func.count(WarehouseStaff.id)).select_from(WarehouseStaff)

    if search:
        query = query.join(User, WarehouseStaff.user_id == User.id)
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
                WarehouseStaff.staff_code.ilike(search_term),
            )
        )

    if filter:
        for k, v in filter.items():
            if hasattr(WarehouseStaff, k) and v is not None:
                query = query.where(getattr(WarehouseStaff, k) == v)

    return db.scalar(query) or 0


def update_by_id(
    db: Session,
    warehouse_staff_id: UUID,
    warehouse_staff_data: dict,
) -> WarehouseStaff | None:
    warehouse_staff = find_by_id(db, warehouse_staff_id)
    if not warehouse_staff:
        return None

    for k, v in warehouse_staff_data.items():
        setattr(warehouse_staff, k, v)

    db.flush()
    db.refresh(warehouse_staff)

    return warehouse_staff


def delete_by_id(
    db: Session,
    warehouse_staff_id: UUID,
) -> bool:
    warehouse_staff = find_by_id(db, warehouse_staff_id)
    if not warehouse_staff:
        return False

    warehouse_staff.is_active = False
    warehouse_staff.deleted_at = datetime.now(UTC)
    if warehouse_staff.user:
        warehouse_staff.user.status = USER_STATUSES.INACTIVE

    db.flush()
    return True


def restore_by_id(
    db: Session,
    warehouse_staff_id: UUID,
) -> WarehouseStaff | None:
    warehouse_staff = find_by_id(db, warehouse_staff_id)
    if not warehouse_staff or warehouse_staff.is_active:
        return None

    warehouse_staff.is_active = True
    warehouse_staff.deleted_at = None
    if warehouse_staff.user:
        warehouse_staff.user.status = USER_STATUSES.ACTIVE

    db.flush()
    db.refresh(warehouse_staff)
    return warehouse_staff
