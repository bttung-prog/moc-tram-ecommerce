import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

import jwt
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from constants.messages import AUTH_MESSAGES
from constants.roles import ROLES
from constants.user_statuses import USER_STATUSES
from modules.auth import auth_repository
from modules.user import user_service
from utils.api_error import ApiError
from utils.email import send_otp_email
from utils.jwt import (
    generate_access_token,
    generate_refresh_token,
    verify_refresh_token,
)
from utils.password import compare_password, hash_password


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
        role=role,
    )

    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "phone": new_user.phone,
        "role": new_user.role,
        "status": new_user.status,
    }


def login(db: Session, email: str, phone: str, password: str):
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

    payload = {"user_id": str(user.id), "role": user.role}

    access_token = generate_access_token(payload)
    refresh_token = generate_refresh_token(payload)

    auth_repository.delete_refresh_token_by_user_id(db=db, user_id=user.id)
    auth_repository.create_refresh_token(
        db=db, user_id=user.id, refresh_token=refresh_token
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
        raise ApiError(401, AUTH_MESSAGES["INVALID_OR_EXPIRED_REFRESH_TOKEN"]) from None

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


def revoke_refresh_token_by_user_id(db: Session, user_id: UUID) -> bool:
    result = auth_repository.delete_refresh_token_by_user_id(db, user_id)
    return result


def forgot_password(
    db: Session,
    email: str,
    background_tasks: BackgroundTasks | None = None,
) -> dict:
    clean_email = email.strip().lower()

    user = user_service.get_by_email(db, clean_email)
    if not user:
        raise ApiError(404, AUTH_MESSAGES["EMAIL_NOT_FOUND"])

    if user.status != USER_STATUSES.ACTIVE.value:
        raise ApiError(403, AUTH_MESSAGES["ACCOUNT_INACTIVE_OR_LOCKED"])

    existing_otp = auth_repository.find_latest_password_reset_otp(db, clean_email)
    if existing_otp:
        created_at = existing_otp.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=UTC)

        time_diff = (datetime.now(UTC) - created_at).total_seconds()
        if time_diff < 60:
            raise ApiError(429, AUTH_MESSAGES["OTP_RESEND_COOLDOWN"])

    otp = f"{secrets.randbelow(90_000_000) + 10_000_000}"
    expires_at = datetime.now(UTC) + timedelta(minutes=5)

    auth_repository.create_password_reset_otp(
        db=db,
        email=clean_email,
        otp=otp,
        expires_at=expires_at,
    )

    if background_tasks:
        background_tasks.add_task(send_otp_email, to_email=clean_email, otp=otp)
    else:
        send_otp_email(to_email=clean_email, otp=otp)

    return {"email": clean_email}


def verify_otp(db: Session, email: str, otp: str) -> bool:
    clean_email = email.strip().lower()
    clean_otp = otp.strip()

    user = user_service.get_by_email(db, clean_email)
    if not user:
        raise ApiError(404, AUTH_MESSAGES["EMAIL_NOT_FOUND"])

    otp_record = auth_repository.find_latest_password_reset_otp(db, clean_email)
    if not otp_record:
        raise ApiError(400, AUTH_MESSAGES["OTP_NOT_FOUND"])

    if otp_record.attempts >= 5:
        auth_repository.delete_password_reset_otp_by_email(db, clean_email)
        raise ApiError(400, AUTH_MESSAGES["OTP_MAX_ATTEMPTS"])

    expires_at = otp_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)

    if datetime.now(UTC) > expires_at:
        auth_repository.delete_password_reset_otp_by_email(db, clean_email)
        raise ApiError(400, AUTH_MESSAGES["OTP_EXPIRED"])

    if otp_record.otp != clean_otp:
        new_attempts = auth_repository.increment_otp_attempts(db, otp_record)
        remaining = 5 - new_attempts
        if remaining <= 0:
            auth_repository.delete_password_reset_otp_by_email(db, clean_email)
            raise ApiError(400, AUTH_MESSAGES["OTP_MAX_ATTEMPTS"])
        raise ApiError(
            400, f"{AUTH_MESSAGES['OTP_INVALID']}. Bạn còn {remaining} lần thử."
        )

    return True


def reset_password(
    db: Session,
    email: str,
    otp: str,
    new_password: str,
) -> bool:
    clean_email = email.strip().lower()
    clean_otp = otp.strip()
    clean_password = new_password.strip()

    user = user_service.get_by_email(db, clean_email)
    if not user:
        raise ApiError(404, AUTH_MESSAGES["EMAIL_NOT_FOUND"])

    if user.status != USER_STATUSES.ACTIVE.value:
        raise ApiError(403, AUTH_MESSAGES["ACCOUNT_INACTIVE_OR_LOCKED"])

    verify_otp(db=db, email=clean_email, otp=clean_otp)

    if compare_password(clean_password, user.password):
        raise ApiError(400, AUTH_MESSAGES["NEW_PASSWORD_SAME_AS_OLD"])

    new_hashed_password = hash_password(clean_password)

    user_service.update_password(
        db=db, user_id=user.id, new_hashed_password=new_hashed_password
    )

    auth_repository.delete_password_reset_otp_by_email(db, clean_email)
    auth_repository.delete_refresh_token_by_user_id(db, user.id)

    return True


def change_password(
    db: Session,
    user_id: UUID,
    old_password: str,
    new_password: str,
) -> dict:
    user = user_service.get_by_id(db, user_id)
    if not user:
        raise ApiError(404, AUTH_MESSAGES["USER_NOT_FOUND"])

    if user.status != USER_STATUSES.ACTIVE.value:
        raise ApiError(403, AUTH_MESSAGES["ACCOUNT_INACTIVE_OR_LOCKED"])

    current_hashed_password = user_service.get_password_by_id(db, user_id)

    if not compare_password(old_password, current_hashed_password):
        raise ApiError(401, AUTH_MESSAGES["OLD_PASSWORD_INCORRECT"])

    if compare_password(new_password, current_hashed_password):
        raise ApiError(400, AUTH_MESSAGES["NEW_PASSWORD_SAME_AS_OLD"])

    new_hashed_password = hash_password(new_password)

    updated_user = user_service.update_password(db, user_id, new_hashed_password)

    auth_repository.delete_refresh_token_by_user_id(db, user_id)

    return {
        "id": updated_user.id,
        "email": updated_user.email,
        "full_name": updated_user.full_name,
        "phone": updated_user.phone,
        "role": updated_user.role,
        "status": updated_user.status,
    }
