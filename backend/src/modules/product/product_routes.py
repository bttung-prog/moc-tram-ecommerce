from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.auth_dependency import auth_dependency
from middlewares.authorize_dependency import authorize
from modules.product import product_controller

product_router = APIRouter()


product_router.add_api_route(
    "",
    product_controller.get_all,
    methods=["GET"],
)

product_router.add_api_route(
    "/active",
    product_controller.get_active_products,
    methods=["GET"],
)

product_router.add_api_route(
    "/category/{category_id}",
    product_controller.get_by_category_id,
    methods=["GET"],
)

product_router.add_api_route(
    "/{product_id}",
    product_controller.get_by_id,
    methods=["GET"],
)

product_router.add_api_route(
    "",
    product_controller.create,
    methods=["POST"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)

product_router.add_api_route(
    "/{product_id}",
    product_controller.update,
    methods=["PATCH"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)

product_router.add_api_route(
    "/{product_id}/status",
    product_controller.update_status,
    methods=["PATCH"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)

product_router.add_api_route(
    "/{product_id}/discontinue",
    product_controller.discontinue,
    methods=["PATCH"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)

product_router.add_api_route(
    "/{product_id}/activate",
    product_controller.activate,
    methods=["PATCH"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)

product_router.add_api_route(
    "/{product_id}",
    product_controller.delete,
    methods=["DELETE"],
    dependencies=[Depends(auth_dependency), Depends(authorize(ROLES.ADMIN))],
)
