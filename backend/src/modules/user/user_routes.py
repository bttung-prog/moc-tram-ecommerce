from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.user import user_controller

ALL_ROLES = [role.value for role in ROLES]


user_router = APIRouter()


user_router.add_api_route(
    "/me",
    user_controller.get_me,
    methods=["GET"],
    dependencies=[Depends(authorize(*ALL_ROLES))],
)


user_router.add_api_route(
    "/me",
    user_controller.update_me,
    methods=["PATCH"],
    dependencies=[Depends(authorize(*ALL_ROLES))],
)


user_router.add_api_route(
    "/me/change-password",
    user_controller.change_password,
    methods=["PATCH"],
    dependencies=[Depends(authorize(*ALL_ROLES))],
)
