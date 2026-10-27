from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.order import order_controller

order_router = APIRouter()

order_router.add_api_route(
    "/me",
    order_controller.get_my_orders,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.CUSTOMER,
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)

order_router.add_api_route(
    "/number/{order_number}",
    order_controller.get_by_order_number,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.CUSTOMER,
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)

order_router.add_api_route(
    "",
    order_controller.get_all,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)

order_router.add_api_route(
    "",
    order_controller.create,
    methods=["POST"],
    dependencies=[
        Depends(
            authorize(
                ROLES.CUSTOMER,
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)

order_router.add_api_route(
    "/{order_id}",
    order_controller.get_by_id,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.CUSTOMER,
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)

order_router.add_api_route(
    "/{order_id}/status",
    order_controller.update_status,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)

order_router.add_api_route(
    "/{order_id}/cancel",
    order_controller.cancel,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.CUSTOMER,
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)

order_router.add_api_route(
    "/{order_id}",
    order_controller.update_shipping_info,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.CUSTOMER,
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)
