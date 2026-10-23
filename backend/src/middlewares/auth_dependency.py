import jwt
from fastapi.requests import Request

from constants.messages import AUTH_MESSAGES, COMMON_MESSAGES
from utils.api_error import ApiError
from utils.jwt import verify_access_token


def auth_dependency(request: Request):
    auth_header: str | None = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise ApiError(401, COMMON_MESSAGES["UNAUTHORIZED"])

    parts = auth_header.split(maxsplit=1)
    if len(parts) < 2 or not parts[1].strip():
        raise ApiError(401, COMMON_MESSAGES["UNAUTHORIZED"])

    access_token = parts[1].strip()

    try:
        payload: dict = verify_access_token(access_token)
        request.state.user = payload
    except jwt.ExpiredSignatureError:
        raise ApiError(401, AUTH_MESSAGES["TOKEN_EXPIRED"]) from None
    except jwt.InvalidTokenError:
        raise ApiError(401, AUTH_MESSAGES["INVALID_ACCESS_TOKEN"]) from None
