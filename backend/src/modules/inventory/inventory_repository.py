from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from modules.inventory.inventory import Inventory


def create(db: Session, inventory_data: dict) -> Inventory:
    new_inventory = Inventory(**inventory_data)

    db.add(new_inventory)
    db.flush()
    db.refresh(new_inventory)

    return new_inventory


def find_by_id(db: Session, inventory_id: UUID) -> Inventory | None:
    return db.get(Inventory, inventory_id)


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Inventory]:
    query = select(Inventory)

    if filter:
        query = query.filter_by(**filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(Inventory.location.ilike(search_term))

    query = query.order_by(desc(Inventory.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
) -> int:
    query = select(func.count(Inventory.id)).select_from(Inventory)

    if filter:
        query = query.filter_by(**filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(Inventory.location.ilike(search_term))

    return db.scalar(query) or 0


def find_by_product_id(
    db: Session,
    product_id: UUID,
) -> Inventory | None:
    query = select(Inventory).where(Inventory.product_id == product_id)
    return db.scalar(query)


def find_by_warehouse_id(
    db: Session,
    warehouse_id: UUID,
    skip: int = 0,
    limit: int = 10,
) -> list[Inventory]:
    query = (
        select(Inventory)
        .where(Inventory.warehouse_id == warehouse_id)
        .order_by(desc(Inventory.created_at))
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(query).all())


def find_by_warehouse_and_product(
    db: Session,
    warehouse_id: UUID,
    product_id: UUID,
) -> list[Inventory]:
    query = (
        select(Inventory)
        .where(
            Inventory.warehouse_id == warehouse_id,
            Inventory.product_id == product_id,
        )
        .order_by(desc(Inventory.created_at))
    )
    return list(db.scalars(query).all())


def get_total_quantity_by_product(
    db: Session,
    product_id: UUID,
) -> int:
    query = select(func.coalesce(func.sum(Inventory.quantity), 0)).where(
        Inventory.product_id == product_id
    )
    return db.scalar(query) or 0


def update_by_id(
    db: Session,
    inventory_id: UUID,
    inventory_data: dict,
) -> Inventory | None:
    inventory = find_by_id(db, inventory_id)

    if not inventory:
        return None

    for k, v in inventory_data.items():
        setattr(inventory, k, v)

    db.flush()
    db.refresh(inventory)

    return inventory


def delete_by_id(
    db: Session,
    inventory_id: UUID,
) -> bool:
    inventory = find_by_id(db, inventory_id)

    if not inventory:
        return False

    db.delete(inventory)
    db.flush()

    return True
