from uuid import UUID

from fastapi import Depends, Query, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import WAREHOUSE_STAFF_MESSAGES
from modules.warehouse_staff import warehouse_staff_service
from modules.warehouse_staff.warehouse_staff_validator import (
    CreateWarehouseStaffSchema,
    UpdateWarehouseStaffSchema,
)
from utils.api_response import ApiResponse


def create(
    payload: CreateWarehouseStaffSchema,
    db: Session = Depends(get_db),
):
    new_warehouse_staff = warehouse_staff_service.create(
        db=db,
        user_id=payload.user_id,
        warehouse_id=payload.warehouse_id,
        position=payload.position,
    )

    return ApiResponse.created(
        data=new_warehouse_staff,
        message=WAREHOUSE_STAFF_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    warehouse_id: UUID | None = Query(default=None),
    position: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if warehouse_id is not None:
        filters["warehouse_id"] = warehouse_id
    if position is not None:
        filters["position"] = position
    if is_active is not None:
        filters["is_active"] = is_active

    result = warehouse_staff_service.get_all(
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


def get_me(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    staff = warehouse_staff_service.get_or_create_by_user_id(db, user_id)

    return ApiResponse.success(
        data=staff,
    )


def get_by_id(
    warehouse_staff_id: UUID,
    db: Session = Depends(get_db),
):
    staff = warehouse_staff_service.get_by_id(db, warehouse_staff_id)

    return ApiResponse.success(
        data=staff,
    )


def get_by_user_id(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    staff = warehouse_staff_service.get_by_user_id(db, user_id)

    return ApiResponse.success(
        data=staff,
    )


def update(
    warehouse_staff_id: UUID,
    payload: UpdateWarehouseStaffSchema,
    db: Session = Depends(get_db),
):
    updated_staff = warehouse_staff_service.update(
        db=db,
        warehouse_staff_id=warehouse_staff_id,
        warehouse_id=payload.warehouse_id,
        position=payload.position,
    )

    return ApiResponse.success(
        data=updated_staff,
        message=WAREHOUSE_STAFF_MESSAGES["UPDATED"],
    )


def delete(
    warehouse_staff_id: UUID,
    db: Session = Depends(get_db),
):
    warehouse_staff_service.delete(
        db=db,
        warehouse_staff_id=warehouse_staff_id,
    )

    return ApiResponse.success(
        message=WAREHOUSE_STAFF_MESSAGES["DELETED"],
    )


def restore(
    warehouse_staff_id: UUID,
    db: Session = Depends(get_db),
):
    restored_staff = warehouse_staff_service.restore(
        db=db,
        warehouse_staff_id=warehouse_staff_id,
    )

    return ApiResponse.success(
        data=restored_staff,
        message=WAREHOUSE_STAFF_MESSAGES["RESTORED"],
    )
