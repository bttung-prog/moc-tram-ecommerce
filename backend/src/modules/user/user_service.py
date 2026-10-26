import math
from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import COMMON_MESSAGES, USER_MESSAGES
from constants.roles import ROLES
from constants.user_statuses import USER_STATUSES
from modules.user import user_repository
from modules.user.user import User
from utils.api_error import ApiError
from utils.password import hash_password


def create(
    db: Session,
    email: str,
    password: str,
    phone: str,
    full_name: str,
    role: str = ROLES.CUSTOMER.value,
    status: str = USER_STATUSES.ACTIVE.value,
):
    if not email or not password or not phone or not full_name or not role:
        raise ApiError(
            status_code=400,
            message=COMMON_MESSAGES["ALL_FIELDS_REQUIRED"],
        )

    clean_email = email.strip().lower()
    clean_phone = phone.strip()
    clean_full_name = full_name.strip()
    clean_password = password.strip()

    existing_email = user_repository.find_by_email(db, clean_email)
    if existing_email:
        raise ApiError(409, USER_MESSAGES["EMAIL_EXISTS"])

    existing_phone = user_repository.find_by_phone(db, clean_phone)
    if existing_phone:
        raise ApiError(409, USER_MESSAGES["PHONE_EXISTS"])

    hashed_password = hash_password(clean_password)

    new_user = user_repository.create(
        db=db,
        user_data={
            "email": clean_email,
            "password": hashed_password,
            "phone": clean_phone,
            "full_name": clean_full_name,
            "role": role,
            "status": status,
        },
    )

    return new_user


def activate_user(db: Session, user_id: UUID) -> User:
    user = user_repository.update_by_id(
        db, user_id, {"status": USER_STATUSES.ACTIVE.value}
    )

    if not user:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return user


def get_by_id(db: Session, user_id: UUID) -> User | None:
    user = user_repository.find_by_id(db, user_id)
    if not user:
        raise ApiError(404, COMMON_MESSAGES["NOT_FOUND"])

    return user


def get_by_email(db: Session, email: str) -> User | None:
    if not email or not email.strip():
        return None

    return user_repository.find_by_email(db, email.strip().lower())


def get_by_phone(db: Session, phone: str) -> User | None:
    if not phone or not phone.strip():
        return None

    return user_repository.find_by_phone(db, phone.strip())


def update_me(
    db: Session,
    user_id: UUID,
    phone: str | None,
    full_name: str | None,
) -> User | None:
    update_data = {}

    if phone:
        clean_phone = phone.strip()
        existing_phone_user = user_repository.find_by_phone(db, clean_phone)

        if existing_phone_user and str(existing_phone_user.id) != str(user_id):
            raise ApiError(409, USER_MESSAGES["PHONE_EXISTS"])

        update_data["phone"] = clean_phone

    if full_name:
        clean_full_name = full_name.strip()
        update_data["full_name"] = clean_full_name

    user = user_repository.update_by_id(db, user_id, update_data)
    if not user:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return user


def get_password_by_id(db: Session, user_id: UUID) -> str:
    current_hashed_password = user_repository.find_password_by_id(db, user_id)

    if not current_hashed_password:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return current_hashed_password


def update_password(db: Session, user_id: UUID, new_hashed_password: str) -> User:
    user = user_repository.update_by_id(db, user_id, {"password": new_hashed_password})

    if not user:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return user


def update_last_login(db: Session, user_id: UUID) -> User:
    user = user_repository.update_by_id(db, user_id, {"last_login": datetime.now()})

    if not user:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return user


def get_all(
    db: Session,
    filters: dict | None = None,
    page: int = 1,
    limit: int = 10,
):
    if filters is None:
        filters = {}

    page_number = max(1, int(page))
    limit_number = max(1, int(limit))

    skip = (page_number - 1) * limit_number

    users = user_repository.find_all(db, filters, limit_number, skip)

    total_users = user_repository.count_all(db, filters)

    return {
        "data": users,
        "pagnition": {
            "page": page_number,
            "limit": limit_number,
            "total_users": total_users,
            "total_pages": math.ceil(total_users / limit_number),
        },
    }
