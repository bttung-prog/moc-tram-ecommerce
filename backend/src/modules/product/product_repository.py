from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from modules.product.product import Product


def create(db: Session, product_data: dict) -> Product:
    new_product = Product(**product_data)

    db.add(new_product)
    db.flush()
    db.refresh(new_product)

    return new_product


def find_by_id(db: Session, product_id: UUID) -> Product | None:
    return db.get(Product, product_id)


def find_by_name(db: Session, name: str) -> Product | None:
    query = select(Product).where(Product.name == name)
    return db.scalar(query)


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Product]:
    query = select(Product)

    if filter:
        query = query.filter_by(**filter)

    if search:
        query = query.where(Product.name.ilike(f"%{search.strip()}%"))

    query = query.order_by(desc(Product.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
) -> int:
    query = select(func.count(Product.id)).select_from(Product)

    if filter:
        query = query.filter_by(**filter)

    if search:
        query = query.where(Product.name.ilike(f"%{search.strip()}%"))

    return db.scalar(query) or 0


def find_by_category_id(
    db: Session,
    category_id: UUID,
    skip: int = 0,
    limit: int = 10,
) -> list[Product]:
    query = (
        select(Product)
        .where(Product.category_id == category_id)
        .order_by(desc(Product.created_at))
        .offset(skip)
        .limit(limit)
    )

    return list(db.scalars(query).all())


def update_by_id(db: Session, product_id: UUID, product_data: dict) -> Product | None:
    product = db.get(Product, product_id)

    if not product:
        return None

    for k, v in product_data.items():
        setattr(product, k, v)

    db.flush()
    db.refresh(product)

    return product


def delete_by_id(db: Session, product_id: UUID) -> bool:
    product = db.get(Product, product_id)

    if not product:
        return False

    db.delete(product)
    db.flush()

    return True
