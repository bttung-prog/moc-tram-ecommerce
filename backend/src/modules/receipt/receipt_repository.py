from uuid import UUID

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from modules.receipt.receipt import Receipt


def create(db: Session, receipt_data: dict) -> Receipt:
    new_receipt = Receipt(**receipt_data)

    db.add(new_receipt)
    db.flush()
    db.refresh(new_receipt)

    return new_receipt


def find_by_id(db: Session, receipt_id: UUID) -> Receipt | None:
    return db.get(Receipt, receipt_id)


def find_by_product_id(
    db: Session,
    product_id: UUID,
    skip: int = 0,
    limit: int = 10,
) -> list[Receipt]:
    query = (
        select(Receipt)
        .where(Receipt.product_id == product_id)
        .order_by(desc(Receipt.created_at))
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(query).all())


def find_by_warehouse_id(
    db: Session,
    warehouse_id: UUID,
    skip: int = 0,
    limit: int = 10,
) -> list[Receipt]:
    query = (
        select(Receipt)
        .where(Receipt.warehouse_id == warehouse_id)
        .order_by(desc(Receipt.created_at))
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(query).all())


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Receipt]:
    query = select(Receipt)

    if filter:
        query = query.filter_by(**filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Receipt.supplier.ilike(search_term),
                Receipt.note.ilike(search_term),
            )
        )

    query = query.order_by(desc(Receipt.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
) -> int:
    query = select(func.count(Receipt.id)).select_from(Receipt)

    if filter:
        query = query.filter_by(**filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Receipt.supplier.ilike(search_term),
                Receipt.note.ilike(search_term),
            )
        )

    return db.scalar(query) or 0


def update_by_id(
    db: Session,
    receipt_id: UUID,
    receipt_data: dict,
) -> Receipt | None:
    receipt = find_by_id(db, receipt_id)

    if not receipt:
        return None

    for k, v in receipt_data.items():
        setattr(receipt, k, v)

    db.flush()
    db.refresh(receipt)

    return receipt
