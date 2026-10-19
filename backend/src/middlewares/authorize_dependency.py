from fastapi import Request

from constants.messages import COMMON_MESSAGES

from utils.api_error import ApiError

def authorize(*allowed_roles: tuple[str]):
    def dependency(request: Request):
        if (not request.state.user or 
            not request.state.user.user_id or 
            not request.state.user.role):
            raise ApiError(403, COMMON_MESSAGES.FORBIDDEN_DEFAULT)

        user_role = request.state.user.role
        if user_role not in allowed_roles:
            raise ApiError(403, COMMON_MESSAGES.FORBIDDEN)

    return dependency
