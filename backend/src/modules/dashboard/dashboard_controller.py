from fastapi import Depends, Query

from configs.db_connection import get_db
from modules.dashboard import dashboard_service
from utils.api_response import ApiResponse


def get_overview(
    days: int = Query(default=30, ge=1, le=365),
    db=Depends(get_db),
):
    overview = dashboard_service.get_overview(db=db, days=days)
    return ApiResponse.success(data=overview)
