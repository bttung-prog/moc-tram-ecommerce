from fastapi import Request

from constants.messages import COMMON_MESSAGES

from utils.api_error import ApiError

def authorize(*allowed_roles: str):
    def dependency(request: Request):
        user: dict = request.state.user

        if (not user or 
            not user.get("user_id") or 
            not user.get("role")):
            raise ApiError(403, COMMON_MESSAGES["FORBIDDEN_DEFAULT"])

        user_role = user["role"]
        if user_role not in allowed_roles:
            raise ApiError(403, COMMON_MESSAGES["FORBIDDEN"])

    return dependency
