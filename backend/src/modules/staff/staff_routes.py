from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.staff import staff_controller

staff_router = APIRouter()

staff_router.add_api_route(
    "/me",
    staff_controller.get_me,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.STAFF,
                ROLES.ADMIN,
            )
        )
    ],
)

staff_router.add_api_route(
    "/user/{user_id}",
    staff_controller.get_by_user_id,
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

staff_router.add_api_route(
    "",
    staff_controller.get_all,
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

staff_router.add_api_route(
    "",
    staff_controller.create,
    methods=["POST"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

staff_router.add_api_route(
    "/{staff_id}/restore",
    staff_controller.restore,
    methods=["POST"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

staff_router.add_api_route(
    "/{staff_id}",
    staff_controller.get_by_id,
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

staff_router.add_api_route(
    "/{staff_id}",
    staff_controller.update,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)

staff_router.add_api_route(
    "/{staff_id}",
    staff_controller.delete,
    methods=["DELETE"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
            )
        )
    ],
)
