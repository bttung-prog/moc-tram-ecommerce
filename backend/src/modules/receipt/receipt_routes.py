from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.receipt import receipt_controller

receipt_router = APIRouter()

receipt_router.add_api_route(
    "",
    receipt_controller.get_all,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.WAREHOUSE_STAFF,
            )
        )
    ],
)

receipt_router.add_api_route(
    "",
    receipt_controller.create,
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

receipt_router.add_api_route(
    "/{receipt_id}",
    receipt_controller.get_by_id,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.WAREHOUSE_STAFF,
            )
        )
    ],
)

receipt_router.add_api_route(
    "/{receipt_id}/cancel",
    receipt_controller.cancel,
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
