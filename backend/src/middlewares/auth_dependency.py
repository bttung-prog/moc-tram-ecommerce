import jwt

from fastapi.requests import Request

from constants.messages import AUTH_MESSAGES, COMMON_MESSAGES

from utils.api_error import ApiError
from utils.jwt import verify_access_token


def auth_dependency(request: Request):
    try:
        auth_header: str | None = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise ApiError(401, COMMON_MESSAGES["UNAUTHORIZED"])

        access_token: str = auth_header.split(" ")[1]
        if not access_token:
            raise ApiError(401, COMMON_MESSAGES["UNAUTHORIZED"])

        payload: dict = verify_access_token(access_token)
        request.state.user = payload
    except Exception as e:
        if isinstance(e, ApiError):
            raise
        elif isinstance(e, jwt.ExpiredSignatureError):
            raise ApiError(401, AUTH_MESSAGES["TOKEN_EXPIRED"])
        elif isinstance(e, jwt.InvalidTokenError):
            raise ApiError(401, AUTH_MESSAGES["INVALID_ACCESS_TOKEN"])
        else:
            raise ApiError(401, COMMON_MESSAGES["UNAUTHORIZED"])
