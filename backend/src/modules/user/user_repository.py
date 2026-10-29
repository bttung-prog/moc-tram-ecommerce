from uuid import UUID

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session, defer

from modules.user.user import User


def create(db: Session, user_data: dict) -> User:
    new_user = User(**user_data)

    db.add(new_user)
    db.flush()
    db.refresh(new_user)

    return new_user


def _base_user_query():
    return select(User).options(defer(User.password))


def find_by_id(db: Session, user_id: UUID) -> User | None:
    query = _base_user_query().where(User.id == user_id)
    return db.scalar(query)


def find_by_email(db: Session, email: str) -> User | None:
    query = select(User).where(User.email == email)
    return db.scalar(query)


def find_by_phone(db: Session, phone: str) -> User | None:
    query = select(User).where(User.phone == phone)
    return db.scalar(query)


def find_password_by_id(db: Session, user_id: UUID) -> str:
    query = select(User.password).where(User.id == user_id)

    result = db.scalar(query)
    return result


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[User]:
    query = _base_user_query()

    if filter:
        for k, v in filter.items():
            if hasattr(User, k) and v is not None:
                query = query.where(getattr(User, k) == v)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
            )
        )

    query = query.order_by(desc(User.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
) -> int:
    query = select(func.count(User.id)).select_from(User)

    if filter:
        for k, v in filter.items():
            if hasattr(User, k) and v is not None:
                query = query.where(getattr(User, k) == v)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
            )
        )

    return db.scalar(query) or 0


def update_by_id(db: Session, user_id: UUID, user_data: dict) -> User | None:
    user = db.get(User, user_id)

    if not user:
        return None

    for k, v in user_data.items():
        setattr(user, k, v)

    db.flush()
    db.refresh(user)

    return user
