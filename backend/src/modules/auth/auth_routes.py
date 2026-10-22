from fastapi import APIRouter

from modules.auth import auth_controller

auth_router = APIRouter()


auth_router.add_api_route(
    "/register",
    auth_controller.register,
    methods=["POST"],
)

auth_router.add_api_route(
    "/login",
    auth_controller.login,
    methods=["POST"],
)

auth_router.add_api_route(
    "/refresh-token",
    auth_controller.refresh_access_token,
    methods=["POST"],
)

auth_router.add_api_route(
    "/logout",
    auth_controller.logout,
    methods=["POST"],
)
