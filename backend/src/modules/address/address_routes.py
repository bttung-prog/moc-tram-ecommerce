from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.address import address_controller

address_router = APIRouter()

# Customer self-service routes
address_router.add_api_route(
    "/me",
    address_controller.get_my_addresses,
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

address_router.add_api_route(
    "/me/default",
    address_controller.get_my_default_address,
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

address_router.add_api_route(
    "/me",
    address_controller.create_my_address,
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

address_router.add_api_route(
    "/me/{address_id}",
    address_controller.get_my_address_by_id,
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

address_router.add_api_route(
    "/me/{address_id}",
    address_controller.update_my_address,
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

address_router.add_api_route(
    "/me/{address_id}/default",
    address_controller.set_my_default_address,
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

address_router.add_api_route(
    "/me/{address_id}",
    address_controller.delete_my_address,
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

# Admin / Staff management routes
address_router.add_api_route(
    "/customer/{customer_id}",
    address_controller.get_by_customer_id,
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

address_router.add_api_route(
    "/customer",
    address_controller.create_for_customer,
    methods=["POST"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)

address_router.add_api_route(
    "/{address_id}",
    address_controller.get_by_id,
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

address_router.add_api_route(
    "/{address_id}",
    address_controller.update,
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

address_router.add_api_route(
    "/{address_id}/default",
    address_controller.set_default,
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

address_router.add_api_route(
    "/{address_id}",
    address_controller.delete,
    methods=["DELETE"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.STAFF,
            )
        )
    ],
)
