import os
from datetime import UTC, datetime, timedelta

import jwt


def generate_access_token(payload: dict) -> str:
    payload = payload.copy()
    payload["exp"] = datetime.now(UTC) + timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_EXPIRES"))
    )
    return jwt.encode(payload, key=os.getenv("JWT_ACCESS_SECRET"), algorithm="HS256")


def generate_refresh_token(payload: dict) -> str:
    payload = payload.copy()
    payload["exp"] = datetime.now(UTC) + timedelta(
        days=int(os.getenv("REFRESH_TOKEN_EXPIRES"))
    )
    return jwt.encode(payload, key=os.getenv("JWT_REFRESH_SECRET"), algorithm="HS256")


def verify_access_token(token: str) -> dict:
    return jwt.decode(token, key=os.getenv("JWT_ACCESS_SECRET"), algorithms=["HS256"])


def verify_refresh_token(token: str) -> dict:
    return jwt.decode(token, key=os.getenv("JWT_REFRESH_SECRET"), algorithms=["HS256"])
