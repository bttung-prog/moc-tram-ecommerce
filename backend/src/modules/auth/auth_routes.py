from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.auth_dependency import auth_dependency
from middlewares.authorize_dependency import authorize
from modules.auth import auth_controller

ALL_ROLES = [role.value for role in ROLES]

auth_router = APIRouter()


auth_router.add_api_route(
    "/register",
    auth_controller.register,
    methods=["POST"],
)

auth_router.add_api_route(
    "/verify-register-otp",
    auth_controller.verify_register_otp,
    methods=["POST"],
)

auth_router.add_api_route(
    "/resend-register-otp",
    auth_controller.resend_register_otp,
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

auth_router.add_api_route(
    "/forgot-password",
    auth_controller.forgot_password,
    methods=["POST"],
)

auth_router.add_api_route(
    "/verify-otp",
    auth_controller.verify_otp,
    methods=["POST"],
)

auth_router.add_api_route(
    "/reset-password",
    auth_controller.reset_password,
    methods=["POST"],
)

auth_router.add_api_route(
    "/change-password",
    auth_controller.change_password,
    methods=["PATCH"],
    dependencies=[Depends(auth_dependency), Depends(authorize(*ALL_ROLES))],
)
