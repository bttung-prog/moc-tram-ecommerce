from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.issue import issue_controller

issue_router = APIRouter()

issue_router.add_api_route(
    "",
    issue_controller.get_all,
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

issue_router.add_api_route(
    "",
    issue_controller.create,
    methods=["POST"],
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

issue_router.add_api_route(
    "/order/{order_id}",
    issue_controller.get_by_order_id,
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

issue_router.add_api_route(
    "/{issue_id}",
    issue_controller.get_by_id,
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

issue_router.add_api_route(
    "/{issue_id}/cancel",
    issue_controller.cancel,
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
