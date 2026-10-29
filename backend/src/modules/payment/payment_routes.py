from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.payment import payment_controller

payment_router = APIRouter()

payment_router.add_api_route(
    "",
    payment_controller.get_all,
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

payment_router.add_api_route(
    "",
    payment_controller.create,
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

payment_router.add_api_route(
    "/orders/{order_id}",
    payment_controller.get_by_order_id,
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

payment_router.add_api_route(
    "/orders/{order_id}/simulate",
    payment_controller.simulate_payment,
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

payment_router.add_api_route(
    "/{payment_id}",
    payment_controller.get_by_id,
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

payment_router.add_api_route(
    "/{payment_id}/confirm",
    payment_controller.confirm_payment,
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
