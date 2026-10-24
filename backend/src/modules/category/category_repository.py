from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from modules.category.category import Category


def create(db: Session, category_data: dict) -> Category:
    new_category = Category(**category_data)

    db.add(new_category)
    db.flush()
    db.refresh(new_category)

    return new_category


def find_by_id(db: Session, category_id: UUID) -> Category | None:
    return db.get(Category, category_id)


def find_by_name(db: Session, name: str) -> Category | None:
    query = select(Category).where(Category.name == name)
    return db.scalar(query)


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Category]:
    query = select(Category)

    if filter:
        query = query.filter_by(**filter)

    if search:
        query = query.where(Category.name.ilike(f"%{search.strip()}%"))

    query = query.order_by(desc(Category.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
) -> int:
    query = select(func.count(Category.id)).select_from(Category)

    if filter:
        query = query.filter_by(**filter)

    if search:
        query = query.where(Category.name.ilike(f"%{search.strip()}%"))

    return db.scalar(query) or 0


def update_by_id(
    db: Session, category_id: UUID, category_data: dict
) -> Category | None:
    category = db.get(Category, category_id)

    if not category:
        return None

    for k, v in category_data.items():
        setattr(category, k, v)

    db.flush()
    db.refresh(category)

    return category


def delete_by_id(db: Session, category_id: UUID) -> bool:
    category = db.get(Category, category_id)

    if not category:
        return False

    db.delete(category)
    db.flush()

    return True
