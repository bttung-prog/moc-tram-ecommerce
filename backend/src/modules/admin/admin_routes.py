from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.admin import admin_controller

admin_router = APIRouter()

admin_router.add_api_route(
    "/users/search",
    admin_controller.search_users,
    methods=["GET"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)

admin_router.add_api_route(
    "/users",
    admin_controller.get_all_users,
    methods=["GET"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)

admin_router.add_api_route(
    "/users",
    admin_controller.create_user,
    methods=["POST"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)

admin_router.add_api_route(
    "/users/{user_id}/role",
    admin_controller.change_role_user,
    methods=["PATCH"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)

admin_router.add_api_route(
    "/users/{user_id}/status",
    admin_controller.change_status_user,
    methods=["PATCH"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)

admin_router.add_api_route(
    "/users/{user_id}",
    admin_controller.get_user_by_id,
    methods=["GET"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)

admin_router.add_api_route(
    "/users/{user_id}",
    admin_controller.update_user,
    methods=["PATCH"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)
