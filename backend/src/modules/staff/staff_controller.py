from uuid import UUID

from fastapi import Depends, Query, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import STAFF_MESSAGES
from modules.staff import staff_service
from modules.staff.staff_validator import (
    CreateStaffSchema,
    UpdateStaffSchema,
)
from utils.api_response import ApiResponse


def create(
    payload: CreateStaffSchema,
    db: Session = Depends(get_db),
):
    new_staff = staff_service.create(
        db=db,
        user_id=payload.user_id,
        department=payload.department,
        position=payload.position,
    )

    return ApiResponse.created(
        data=new_staff,
        message=STAFF_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    department: str | None = Query(default=None),
    position: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if department is not None:
        filters["department"] = department
    if position is not None:
        filters["position"] = position
    if is_active is not None:
        filters["is_active"] = is_active

    result = staff_service.get_all(
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
    staff = staff_service.get_or_create_by_user_id(db, user_id)

    return ApiResponse.success(
        data=staff,
    )


def get_by_id(
    staff_id: UUID,
    db: Session = Depends(get_db),
):
    staff = staff_service.get_by_id(db, staff_id)

    return ApiResponse.success(
        data=staff,
    )


def get_by_user_id(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    staff = staff_service.get_by_user_id(db, user_id)

    return ApiResponse.success(
        data=staff,
    )


def update(
    staff_id: UUID,
    payload: UpdateStaffSchema,
    db: Session = Depends(get_db),
):
    updated_staff = staff_service.update(
        db=db,
        staff_id=staff_id,
        department=payload.department,
        position=payload.position,
    )

    return ApiResponse.success(
        data=updated_staff,
        message=STAFF_MESSAGES["UPDATED"],
    )


def delete(
    staff_id: UUID,
    db: Session = Depends(get_db),
):
    staff_service.delete(
        db=db,
        staff_id=staff_id,
    )

    return ApiResponse.success(
        message=STAFF_MESSAGES["DELETED"],
    )


def restore(
    staff_id: UUID,
    db: Session = Depends(get_db),
):
    restored_staff = staff_service.restore(
        db=db,
        staff_id=staff_id,
    )

    return ApiResponse.success(
        data=restored_staff,
        message=STAFF_MESSAGES["RESTORED"],
    )
