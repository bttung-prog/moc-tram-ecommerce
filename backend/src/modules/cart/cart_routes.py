from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.cart import cart_controller

cart_router = APIRouter()

cart_router.add_api_route(
    "",
    cart_controller.get_cart,
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

cart_router.add_api_route(
    "/items",
    cart_controller.add_to_cart,
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

cart_router.add_api_route(
    "/items/{item_id}",
    cart_controller.update_item_quantity,
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

cart_router.add_api_route(
    "/items/{item_id}",
    cart_controller.remove_item,
    methods=["DELETE"],
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

cart_router.add_api_route(
    "",
    cart_controller.clear_cart,
    methods=["DELETE"],
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

cart_router.add_api_route(
    "/merge",
    cart_controller.merge_cart,
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
