from uuid import UUID

from sqlalchemy.orm import Session

from modules.user import user_service
from modules.user.user import User


def create_user(
    db: Session,
    email: str,
    password: str,
    phone: str,
    full_name: str,
    role: str,
    status: str,
) -> User:
    return user_service.create(
        db=db,
        email=email,
        password=password,
        phone=phone,
        full_name=full_name,
        role=role,
        status=status,
    )


def get_all_users(
    db: Session,
    filters: dict | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    return user_service.get_all(
        db=db,
        filters=filters,
        page=page,
        limit=limit,
    )


def get_user_by_id(
    db: Session,
    user_id: UUID,
) -> User:
    return user_service.get_by_id(
        db=db,
        user_id=user_id,
    )


def search_users(
    db: Session,
    search: str,
    filters: dict | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    return user_service.search_users(
        db=db,
        search=search,
        filters=filters,
        page=page,
        limit=limit,
    )


def update_user(
    db: Session,
    user_id: UUID,
    full_name: str | None = None,
    phone: str | None = None,
    email: str | None = None,
) -> User:
    return user_service.update_by_admin(
        db=db,
        user_id=user_id,
        full_name=full_name,
        phone=phone,
        email=email,
    )


def change_role_user(
    db: Session,
    user_id: UUID,
    new_role: str,
    current_admin_id: UUID | None = None,
) -> User:
    return user_service.change_role(
        db=db,
        user_id=user_id,
        new_role=new_role,
        current_admin_id=current_admin_id,
    )


def change_status_user(
    db: Session,
    user_id: UUID,
    new_status: str,
    current_admin_id: UUID | None = None,
) -> User:
    return user_service.change_status(
        db=db,
        user_id=user_id,
        new_status=new_status,
        current_admin_id=current_admin_id,
    )
