from uuid import UUID
import jwt

from sqlalchemy.orm import Session

from utils.api_error import ApiError
from utils.password import compare_password
from utils.jwt import generate_access_token, generate_refresh_token, verify_refresh_token

from constants.roles import ROLES
from constants.messages import AUTH_MESSAGES
from constants.user_statuses import USER_STATUSES

from modules.user import user_service

from modules.auth import auth_repository


def register(
    db: Session,
    email: str,
    password: str,
    full_name: str,
    phone: str,
):
    role = ROLES.CUSTOMER.value

    new_user = user_service.create(
        db=db,
        email=email,
        password=password,
        full_name=full_name,
        phone=phone,
        role=role
    )

    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "phone": new_user.phone,
        "role": new_user.role,
        "status": new_user.status
    }


def login(
    db: Session,
    email: str,
    phone: str,
    password: str
):
    user = None
    if email:
        user = user_service.get_by_email(db, email)
    elif phone:
        user = user_service.get_by_phone(db, phone)

    if not user:
        raise ApiError(401, AUTH_MESSAGES["INVALID_CREDENTIALS"])

    if user.status != USER_STATUSES.ACTIVE.value:
        raise ApiError(403, AUTH_MESSAGES["ACCOUNT_INACTIVE_OR_LOCKED"])

    is_password_valid = compare_password(password, user.password)
    if not is_password_valid:
        raise ApiError(401, AUTH_MESSAGES["INVALID_CREDENTIALS"])

    payload = {
        "user_id": str(user.id),
        "role": user.role
    }

    access_token = generate_access_token(payload)
    refresh_token = generate_refresh_token(payload)

    auth_repository.delete_refresh_token_by_user_id(db=db, user_id=user.id)
    auth_repository.create_refresh_token(
        db=db,
        user_id=user.id,
        refresh_token=refresh_token
    )

    user_service.update_last_login(db=db, user_id=user.id)

    return {
    "user": {
      "id": user.id,
      "email": user.email,
      "full_name": user.full_name,
      "phone": user.phone,
      "role": user.role,
      "status": user.status,
    },
    "tokens": {
      "access_token": access_token,
      "refresh_token": refresh_token,
    },
  }


def refresh_access_token(
    db: Session,
    refresh_token: str,
) -> dict:
    if not refresh_token:
        raise ApiError(401, AUTH_MESSAGES["INVALID_OR_EXPIRED_REFRESH_TOKEN"])

    try:
        payload = verify_refresh_token(refresh_token)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, jwt.PyJWTError):
        raise ApiError(401, AUTH_MESSAGES["INVALID_OR_EXPIRED_REFRESH_TOKEN"])

    user_id: str = payload.get("user_id")
    if not user_id:
        raise ApiError(401, AUTH_MESSAGES["INVALID_OR_EXPIRED_REFRESH_TOKEN"])

    stored_token = auth_repository.find_refresh_token(db, refresh_token)
    if not stored_token:
        raise ApiError(401, AUTH_MESSAGES["INVALID_OR_EXPIRED_REFRESH_TOKEN"])

    user = user_service.get_by_id(db, UUID(user_id))
    if not user:
        raise ApiError(404, AUTH_MESSAGES["USER_NOT_FOUND"])

    if user.status != USER_STATUSES.ACTIVE.value:
        raise ApiError(403, AUTH_MESSAGES["ACCOUNT_INACTIVE_OR_LOCKED"])

    new_payload = {
        "user_id": str(user.id),
        "role": user.role,
    }
    new_access_token = generate_access_token(new_payload)
    new_refresh_token = generate_refresh_token(new_payload)

    auth_repository.delete_refresh_token(db, refresh_token)
    auth_repository.create_refresh_token(
        db=db,
        user_id=user.id,
        refresh_token=new_refresh_token,
    )

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
    }


def logout(
    db: Session,
    refresh_token: str,
) -> bool:
    return auth_repository.delete_refresh_token(db, refresh_token)


def revoke_refresh_token_by_user_id(
    db: Session,
    user_id: UUID
) -> bool:
    result = auth_repository.delete_refresh_token_by_user_id(db, user_id)
    return result
