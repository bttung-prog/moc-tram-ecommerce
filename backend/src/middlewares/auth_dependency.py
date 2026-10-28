
import jwt
from fastapi import Request, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from constants.messages import AUTH_MESSAGES, COMMON_MESSAGES
from utils.api_error import ApiError
from utils.jwt import verify_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def auth_dependency(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise ApiError(401, COMMON_MESSAGES["UNAUTHORIZED"])

    access_token = credentials.credentials.strip()

    if not access_token:
        raise ApiError(401, COMMON_MESSAGES["UNAUTHORIZED"])

    try:
        payload: dict = verify_access_token(access_token)
        request.state.user = payload
    except jwt.ExpiredSignatureError:
        raise ApiError(401, AUTH_MESSAGES["TOKEN_EXPIRED"]) from None
    except jwt.InvalidTokenError:
        raise ApiError(401, AUTH_MESSAGES["INVALID_ACCESS_TOKEN"]) from None
