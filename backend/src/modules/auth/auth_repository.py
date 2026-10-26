import os
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy import delete, desc, select
from sqlalchemy.orm import Session

from modules.auth.password_reset_otp import PasswordResetOtp
from modules.auth.refresh_token import RefreshToken
from modules.auth.register_otp import RegisterOtp


def create_refresh_token(
    db: Session, user_id: UUID, refresh_token: str
) -> RefreshToken:
    expires_ms = int(os.getenv("REFRESH_TOKEN_EXPIRES"))
    expires_at = datetime.now() + timedelta(days=expires_ms)

    new_token = RefreshToken(
        user_id=user_id, token=refresh_token, expires_at=expires_at
    )

    db.add(new_token)
    db.flush()
    db.refresh(new_token)

    return new_token


def find_refresh_token(db: Session, refresh_token: str) -> RefreshToken:
    query = select(RefreshToken).where(RefreshToken.token == refresh_token)

    result = db.scalar(query)
    return result


def delete_refresh_token(db: Session, refresh_token: str) -> bool:
    query = delete(RefreshToken).where(RefreshToken.token == refresh_token)

    result = db.execute(query)
    return result.rowcount > 0


def delete_refresh_token_by_user_id(db: Session, user_id: UUID) -> bool:
    query = delete(RefreshToken).where(RefreshToken.user_id == user_id)

    result = db.execute(query)
    return result.rowcount > 0


def delete_password_reset_otp_by_email(db: Session, email: str) -> bool:
    query = delete(PasswordResetOtp).where(PasswordResetOtp.email == email)

    result = db.execute(query)
    return result.rowcount > 0


def create_password_reset_otp(
    db: Session, email: str, otp: str, expires_at: datetime
) -> PasswordResetOtp:
    delete_password_reset_otp_by_email(db, email)

    new_otp = PasswordResetOtp(
        email=email,
        otp=otp,
        expires_at=expires_at,
        attempts=0,
    )

    db.add(new_otp)
    db.flush()
    db.refresh(new_otp)

    return new_otp


def find_latest_password_reset_otp(db: Session, email: str) -> PasswordResetOtp | None:
    query = (
        select(PasswordResetOtp)
        .where(PasswordResetOtp.email == email)
        .order_by(desc(PasswordResetOtp.created_at))
    )

    return db.scalar(query)


def increment_otp_attempts(db: Session, otp_record: PasswordResetOtp) -> int:
    otp_record.attempts += 1
    db.flush()
    return otp_record.attempts


def delete_register_otp_by_email(db: Session, email: str) -> bool:
    query = delete(RegisterOtp).where(RegisterOtp.email == email)

    result = db.execute(query)
    return result.rowcount > 0


def create_register_otp(
    db: Session, email: str, otp: str, expires_at: datetime
) -> RegisterOtp:
    delete_register_otp_by_email(db, email)

    new_otp = RegisterOtp(
        email=email,
        otp=otp,
        expires_at=expires_at,
        attempts=0,
    )

    db.add(new_otp)
    db.flush()
    db.refresh(new_otp)

    return new_otp


def find_latest_register_otp(db: Session, email: str) -> RegisterOtp | None:
    query = (
        select(RegisterOtp)
        .where(RegisterOtp.email == email)
        .order_by(desc(RegisterOtp.created_at))
    )

    return db.scalar(query)


def increment_register_otp_attempts(db: Session, otp_record: RegisterOtp) -> int:
    otp_record.attempts += 1
    db.flush()
    return otp_record.attempts
