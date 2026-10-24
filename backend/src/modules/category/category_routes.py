from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.auth_dependency import auth_dependency
from middlewares.authorize_dependency import authorize
from modules.category import category_controller

category_router = APIRouter()


category_router.add_api_route(
    "",
    category_controller.get_all,
    methods=["GET"],
)

category_router.add_api_route(
    "/active",
    category_controller.get_active_categories,
    methods=["GET"],
)

category_router.add_api_route(
    "/{category_id}",
    category_controller.get_by_id,
    methods=["GET"],
)

category_router.add_api_route(
    "",
    category_controller.create,
    methods=["POST"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)

category_router.add_api_route(
    "/{category_id}",
    category_controller.update,
    methods=["PATCH"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)

category_router.add_api_route(
    "/{category_id}/toggle",
    category_controller.toggle_active,
    methods=["PATCH"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)

category_router.add_api_route(
    "/{category_id}/status",
    category_controller.update_status,
    methods=["PATCH"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)

category_router.add_api_route(
    "/{category_id}",
    category_controller.delete,
    methods=["DELETE"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)
