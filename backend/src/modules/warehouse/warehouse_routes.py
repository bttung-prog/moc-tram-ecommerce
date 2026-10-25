from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.warehouse import warehouse_controller

warehouse_router = APIRouter()


warehouse_router.add_api_route(
    "",
    warehouse_controller.get_all,
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

warehouse_router.add_api_route(
    "/active",
    warehouse_controller.get_active,
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

warehouse_router.add_api_route(
    "/{warehouse_id}",
    warehouse_controller.get_by_id,
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

warehouse_router.add_api_route(
    "",
    warehouse_controller.create,
    methods=["POST"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

warehouse_router.add_api_route(
    "/{warehouse_id}",
    warehouse_controller.update,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

warehouse_router.add_api_route(
    "/{warehouse_id}/status",
    warehouse_controller.update_status,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

warehouse_router.add_api_route(
    "/{warehouse_id}",
    warehouse_controller.delete,
    methods=["DELETE"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

warehouse_router.add_api_route(
    "/{warehouse_id}/restore",
    warehouse_controller.restore,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)
