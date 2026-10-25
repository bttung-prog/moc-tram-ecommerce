from uuid import UUID

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import WAREHOUSE_MESSAGES
from constants.warehouse_statuses import WAREHOUSE_STATUSES
from modules.warehouse import warehouse_service
from modules.warehouse.warehouse_validator import (
    CreateWarehouseSchema,
    UpdateWarehouseSchema,
    UpdateWarehouseStatusSchema,
)
from utils.api_response import ApiResponse


def create(
    payload: CreateWarehouseSchema,
    db: Session = Depends(get_db),
):
    new_warehouse = warehouse_service.create(
        db=db,
        name=payload.name,
        address=payload.address,
        status=payload.status,
    )

    return ApiResponse.created(
        data=new_warehouse,
        message=WAREHOUSE_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    status: WAREHOUSE_STATUSES | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if status is not None:
        filters["status"] = status

    result = warehouse_service.get_all(
        db=db,
        filters=filters,
        search=search,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def get_active(
    db: Session = Depends(get_db),
):
    warehouses = warehouse_service.get_active(db=db)

    return ApiResponse.success(
        data=warehouses,
    )


def get_by_id(
    warehouse_id: UUID,
    db: Session = Depends(get_db),
):
    warehouse = warehouse_service.get_by_id(
        db=db,
        warehouse_id=warehouse_id,
        check_active=True,
    )

    return ApiResponse.success(
        data=warehouse,
    )


def update(
    warehouse_id: UUID,
    payload: UpdateWarehouseSchema,
    db: Session = Depends(get_db),
):
    updated_warehouse = warehouse_service.update(
        db=db,
        warehouse_id=warehouse_id,
        name=payload.name,
        address=payload.address,
        status=payload.status,
    )

    return ApiResponse.success(
        data=updated_warehouse,
        message=WAREHOUSE_MESSAGES["UPDATED"],
    )


def update_status(
    warehouse_id: UUID,
    payload: UpdateWarehouseStatusSchema,
    db: Session = Depends(get_db),
):
    updated_warehouse = warehouse_service.change_status(
        db=db,
        warehouse_id=warehouse_id,
        status=payload.status,
    )

    return ApiResponse.success(
        data=updated_warehouse,
        message=WAREHOUSE_MESSAGES["STATUS_UPDATED"],
    )


def delete(
    warehouse_id: UUID,
    db: Session = Depends(get_db),
):
    warehouse_service.delete(
        db=db,
        warehouse_id=warehouse_id,
    )

    return ApiResponse.success(
        message=WAREHOUSE_MESSAGES["DELETED"],
    )


def restore(
    warehouse_id: UUID,
    db: Session = Depends(get_db),
):
    restored_warehouse = warehouse_service.restore(
        db=db,
        warehouse_id=warehouse_id,
    )

    return ApiResponse.success(
        data=restored_warehouse,
        message=WAREHOUSE_MESSAGES["RESTORED"],
    )
