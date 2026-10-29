from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.warehouse_staff import warehouse_staff_controller

warehouse_staff_router = APIRouter()

warehouse_staff_router.add_api_route(
    "/me",
    warehouse_staff_controller.get_me,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.WAREHOUSE_STAFF,
                ROLES.ADMIN,
            )
        )
    ],
)

warehouse_staff_router.add_api_route(
    "/user/{user_id}",
    warehouse_staff_controller.get_by_user_id,
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

warehouse_staff_router.add_api_route(
    "",
    warehouse_staff_controller.get_all,
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

warehouse_staff_router.add_api_route(
    "",
    warehouse_staff_controller.create,
    methods=["POST"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

warehouse_staff_router.add_api_route(
    "/{warehouse_staff_id}/restore",
    warehouse_staff_controller.restore,
    methods=["POST"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

warehouse_staff_router.add_api_route(
    "/{warehouse_staff_id}",
    warehouse_staff_controller.get_by_id,
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

warehouse_staff_router.add_api_route(
    "/{warehouse_staff_id}",
    warehouse_staff_controller.update,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

warehouse_staff_router.add_api_route(
    "/{warehouse_staff_id}",
    warehouse_staff_controller.delete,
    methods=["DELETE"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)
