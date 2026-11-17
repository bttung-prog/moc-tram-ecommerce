from fastapi import APIRouter, Depends

from constants.roles import ROLES
from middlewares.authorize_dependency import authorize
from modules.dashboard import dashboard_controller

dashboard_router = APIRouter(dependencies=[Depends(authorize(ROLES.ADMIN))])

dashboard_router.add_api_route(
    "/overview",
    dashboard_controller.get_overview,
    methods=["GET"],
)
