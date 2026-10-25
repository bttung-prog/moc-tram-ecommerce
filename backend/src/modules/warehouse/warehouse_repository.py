from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from constants.warehouse_statuses import WAREHOUSE_STATUSES
from modules.warehouse.warehouse import Warehouse


def create(db: Session, warehouse_data: dict) -> Warehouse:
    new_warehouse = Warehouse(**warehouse_data)

    db.add(new_warehouse)
    db.flush()
    db.refresh(new_warehouse)

    return new_warehouse


def find_by_id(
    db: Session,
    warehouse_id: UUID,
    include_deleted: bool = False,
) -> Warehouse | None:
    query = select(Warehouse).where(Warehouse.id == warehouse_id)

    if not include_deleted:
        query = query.where(Warehouse.deleted_at.is_(None))

    return db.scalar(query)


def find_by_name(
    db: Session,
    name: str,
    include_deleted: bool = False,
) -> Warehouse | None:
    query = select(Warehouse).where(Warehouse.name == name)

    if not include_deleted:
        query = query.where(Warehouse.deleted_at.is_(None))

    return db.scalar(query)


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
    include_deleted: bool = False,
) -> list[Warehouse]:
    query = select(Warehouse)

    if not include_deleted:
        query = query.where(Warehouse.deleted_at.is_(None))

    if filter:
        query = query.filter_by(**filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Warehouse.name.ilike(search_term),
                Warehouse.address.ilike(search_term),
            )
        )

    query = query.order_by(desc(Warehouse.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    include_deleted: bool = False,
) -> int:
    query = select(func.count(Warehouse.id)).select_from(Warehouse)

    if not include_deleted:
        query = query.where(Warehouse.deleted_at.is_(None))

    if filter:
        query = query.filter_by(**filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Warehouse.name.ilike(search_term),
                Warehouse.address.ilike(search_term),
            )
        )

    return db.scalar(query) or 0


def find_active(
    db: Session,
    skip: int = 0,
    limit: int | None = None,
) -> list[Warehouse]:
    query = (
        select(Warehouse)
        .where(
            Warehouse.status == WAREHOUSE_STATUSES.ACTIVE,
            Warehouse.deleted_at.is_(None),
        )
        .order_by(desc(Warehouse.created_at))
        .offset(skip)
    )

    if limit is not None:
        query = query.limit(limit)

    return list(db.scalars(query).all())


def update_by_id(
    db: Session,
    warehouse_id: UUID,
    warehouse_data: dict,
) -> Warehouse | None:
    warehouse = find_by_id(db, warehouse_id)

    if not warehouse:
        return None

    for k, v in warehouse_data.items():
        setattr(warehouse, k, v)

    db.flush()
    db.refresh(warehouse)

    return warehouse


def delete_by_id(db: Session, warehouse_id: UUID) -> bool:
    warehouse = find_by_id(db, warehouse_id)

    if not warehouse:
        return False

    warehouse.deleted_at = datetime.now(UTC)
    warehouse.status = WAREHOUSE_STATUSES.INACTIVE
    db.flush()
    return True


def restore_by_id(db: Session, warehouse_id: UUID) -> Warehouse | None:
    warehouse = db.get(Warehouse, warehouse_id)

    if not warehouse or warehouse.deleted_at is None:
        return None

    warehouse.deleted_at = None
    warehouse.status = WAREHOUSE_STATUSES.ACTIVE
    db.flush()
    db.refresh(warehouse)

    return warehouse


# CamelCase aliases
findAll = find_all
countAll = count_all
findById = find_by_id
findActive = find_active
findByName = find_by_name
updateById = update_by_id
deleteById = delete_by_id
