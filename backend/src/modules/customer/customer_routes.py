from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.customer import customer_controller

customer_router = APIRouter()

customer_router.add_api_route(
    "/me",
    customer_controller.get_me,
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

customer_router.add_api_route(
    "/me",
    customer_controller.update_me,
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

customer_router.add_api_route(
    "/user/{user_id}",
    customer_controller.get_by_user_id,
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

customer_router.add_api_route(
    "",
    customer_controller.get_all,
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

customer_router.add_api_route(
    "",
    customer_controller.create,
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

customer_router.add_api_route(
    "/{customer_id}",
    customer_controller.get_by_id,
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

customer_router.add_api_route(
    "/{customer_id}",
    customer_controller.update,
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

customer_router.add_api_route(
    "/{customer_id}/loyalty-points",
    customer_controller.adjust_loyalty_points,
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

customer_router.add_api_route(
    "/{customer_id}",
    customer_controller.delete,
    methods=["DELETE"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

customer_router.add_api_route(
    "/{customer_id}/restore",
    customer_controller.restore,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)
