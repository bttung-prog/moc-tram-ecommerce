from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.inventory import inventory_controller

inventory_router = APIRouter()

inventory_router.add_api_route(
    "",
    inventory_controller.get_all,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.WAREHOUSE_STAFF,
                ROLES.STAFF,
            )
        )
    ],
)

inventory_router.add_api_route(
    "",
    inventory_controller.create,
    methods=["POST"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.WAREHOUSE_STAFF,
            )
        )
    ],
)

inventory_router.add_api_route(
    "/product/{product_id}",
    inventory_controller.get_by_product_id,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.WAREHOUSE_STAFF,
                ROLES.STAFF,
            )
        )
    ],
)

inventory_router.add_api_route(
    "/product/{product_id}/adjust",
    inventory_controller.adjust_stock,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.WAREHOUSE_STAFF,
            )
        )
    ],
)

inventory_router.add_api_route(
    "/{inventory_id}",
    inventory_controller.get_by_id,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.WAREHOUSE_STAFF,
                ROLES.STAFF,
            )
        )
    ],
)

inventory_router.add_api_route(
    "/{inventory_id}",
    inventory_controller.update,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.WAREHOUSE_STAFF,
            )
        )
    ],
)

inventory_router.add_api_route(
    "/{inventory_id}",
    inventory_controller.delete,
    methods=["DELETE"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.WAREHOUSE_STAFF,
            )
        )
    ],
)
