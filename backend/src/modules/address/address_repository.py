from uuid import UUID

from sqlalchemy import desc, func, select, update
from sqlalchemy.orm import Session

from modules.address.address import Address


def create(db: Session, address_data: dict) -> Address:
    new_address = Address(**address_data)

    db.add(new_address)
    db.flush()
    db.refresh(new_address)

    return new_address


def find_by_id(db: Session, address_id: UUID) -> Address | None:
    return db.get(Address, address_id)


def find_by_customer_id(
    db: Session,
    customer_id: UUID,
) -> list[Address]:
    query = (
        select(Address)
        .where(Address.customer_id == customer_id)
        .order_by(desc(Address.is_default), desc(Address.created_at))
    )
    return list(db.scalars(query).all())


def find_default_by_customer_id(
    db: Session,
    customer_id: UUID,
) -> Address | None:
    query = select(Address).where(
        Address.customer_id == customer_id,
        Address.is_default.is_(True),
    )
    return db.scalar(query)


def count_by_customer_id(
    db: Session,
    customer_id: UUID,
) -> int:
    query = (
        select(func.count(Address.id))
        .select_from(Address)
        .where(Address.customer_id == customer_id)
    )
    return db.scalar(query) or 0


def unset_all_default_by_customer_id(
    db: Session,
    customer_id: UUID,
    exclude_id: UUID | None = None,
) -> None:
    stmt = (
        update(Address)
        .where(
            Address.customer_id == customer_id,
            Address.is_default.is_(True),
        )
        .values(is_default=False)
    )
    if exclude_id is not None:
        stmt = stmt.where(Address.id != exclude_id)

    db.execute(stmt)
    db.flush()


def update_by_id(
    db: Session,
    address_id: UUID,
    address_data: dict,
) -> Address | None:
    address = find_by_id(db, address_id)
    if not address:
        return None

    for k, v in address_data.items():
        setattr(address, k, v)

    db.flush()
    db.refresh(address)

    return address


def delete_by_id(
    db: Session,
    address_id: UUID,
) -> bool:
    address = find_by_id(db, address_id)
    if not address:
        return False

    db.delete(address)
    db.flush()

    return True
