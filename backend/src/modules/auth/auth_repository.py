import os

from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from modules.auth.refresh_token import RefreshToken


def create_refresh_token(
    db: Session,
    user_id: UUID,
    refresh_token: str
) -> RefreshToken:
    expires_ms = int(os.getenv("REFRESH_TOKEN_EXPIRES"))
    expires_at = datetime.now() + timedelta(days=expires_ms)

    new_token = RefreshToken(
        user_id=user_id,
        token=refresh_token,
        expires_at=expires_at
    )

    db.add(new_token)
    db.flush()
    db.refresh(new_token)

    return new_token


def find_refresh_token(
    db: Session,
    refresh_token: str
) -> RefreshToken:
    query = select(
        RefreshToken
    ).where(
        RefreshToken.token == refresh_token
    )

    result = db.scalar(query)
    return result


def delete_refresh_token(
    db: Session,
    refresh_token: str
) -> bool:
    query = delete(
        RefreshToken
    ).where(
        RefreshToken.token == refresh_token
    )

    result = db.execute(query)
    return result.rowcount > 0


def delete_refresh_token_by_user_id(
    db: Session,
    user_id: UUID
) -> bool:
    query = delete(
        RefreshToken
    ).where(
        RefreshToken.user_id == user_id
    )

    result = db.execute(query)
    return result.rowcount > 0
