from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.coupon import coupon_controller

coupon_router = APIRouter()


coupon_router.add_api_route(
    "",
    coupon_controller.get_all,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.STAFF,
                ROLES.CUSTOMER,
                ROLES.WAREHOUSE_STAFF,
            )
        )
    ],
)

coupon_router.add_api_route(
    "",
    coupon_controller.create,
    methods=["POST"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)

coupon_router.add_api_route(
    "/code/{code}",
    coupon_controller.get_by_code,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.STAFF,
                ROLES.CUSTOMER,
                ROLES.WAREHOUSE_STAFF,
            )
        )
    ],
)

coupon_router.add_api_route(
    "/code/{code}",
    coupon_controller.delete_by_code,
    methods=["DELETE"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)

coupon_router.add_api_route(
    "/{coupon_id}",
    coupon_controller.get_by_id,
    methods=["GET"],
    dependencies=[
        Depends(
            authorize(
                ROLES.ADMIN,
                ROLES.STAFF,
                ROLES.CUSTOMER,
                ROLES.WAREHOUSE_STAFF,
            )
        )
    ],
)

coupon_router.add_api_route(
    "/{coupon_id}",
    coupon_controller.update,
    methods=["PATCH"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)

coupon_router.add_api_route(
    "/{coupon_id}",
    coupon_controller.delete_by_id,
    methods=["DELETE"],
    dependencies=[Depends(authorize(ROLES.ADMIN))],
)
