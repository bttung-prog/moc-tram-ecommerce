from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.feedback import feedback_controller

feedback_router = APIRouter()

feedback_router.add_api_route(
    "/me",
    feedback_controller.get_my_feedbacks,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.CUSTOMER,
            )
        )
    ],
)

feedback_router.add_api_route(
    "/order/{order_id}",
    feedback_controller.get_by_order_id,
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

feedback_router.add_api_route(
    "",
    feedback_controller.get_all,
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

feedback_router.add_api_route(
    "",
    feedback_controller.create,
    methods=["POST"],
    dependencies=[
        Depends(
            authorize(
                ROLES.CUSTOMER,
            )
        )
    ],
)

feedback_router.add_api_route(
    "/{feedback_id}",
    feedback_controller.get_by_id,
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

feedback_router.add_api_route(
    "/{feedback_id}",
    feedback_controller.update,
    methods=["PATCH"],
    dependencies=[
        Depends(
            authorize(
                ROLES.CUSTOMER,
            )
        )
    ],
)

feedback_router.add_api_route(
    "/{feedback_id}/reply",
    feedback_controller.reply,
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
