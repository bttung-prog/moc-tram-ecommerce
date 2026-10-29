from uuid import UUID

from fastapi import Depends, Query, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import ADMIN_MESSAGES
from constants.roles import ROLES
from constants.user_statuses import USER_STATUSES
from modules.admin import admin_service
from modules.admin.admin_validator import (
    AdminChangeRoleSchema,
    AdminChangeStatusSchema,
    AdminCreateUserSchema,
    AdminUpdateUserSchema,
)
from utils.api_response import ApiResponse


def create_user(
    payload: AdminCreateUserSchema,
    db: Session = Depends(get_db),
):
    new_user = admin_service.create_user(
        db=db,
        email=payload.email,
        password=payload.password,
        phone=payload.phone,
        full_name=payload.full_name,
        role=payload.role.value,
        status=payload.status.value,
    )

    return ApiResponse.created(
        data=new_user,
        message=ADMIN_MESSAGES["CREATE_USER_SUCCESS"],
    )


def get_all_users(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    role: ROLES | None = Query(default=None),
    status: USER_STATUSES | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if role is not None:
        filters["role"] = role.value
    if status is not None:
        filters["status"] = status.value

    result = admin_service.get_all_users(
        db=db,
        filters=filters,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def get_user_by_id(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    user = admin_service.get_user_by_id(
        db=db,
        user_id=user_id,
    )

    return ApiResponse.success(
        data=user,
        message=ADMIN_MESSAGES["GET_USER_SUCCESS"],
    )


def search_users(
    q: str = Query(
        ..., min_length=1, description="Search keyword (name, email, phone)"
    ),
    role: ROLES | None = Query(default=None),
    status: USER_STATUSES | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    filters = {}
    if role is not None:
        filters["role"] = role.value
    if status is not None:
        filters["status"] = status.value

    result = admin_service.search_users(
        db=db,
        search=q,
        filters=filters,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def update_user(
    user_id: UUID,
    payload: AdminUpdateUserSchema,
    db: Session = Depends(get_db),
):
    updated_user = admin_service.update_user(
        db=db,
        user_id=user_id,
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
    )

    return ApiResponse.success(
        data=updated_user,
        message=ADMIN_MESSAGES["UPDATE_USER_SUCCESS"],
    )


def change_role_user(
    user_id: UUID,
    payload: AdminChangeRoleSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    user_payload = getattr(request.state, "user", {}) or {}
    current_admin_id = (
        UUID(user_payload.get("user_id")) if user_payload.get("user_id") else None
    )
    updated_user = admin_service.change_role_user(
        db=db,
        user_id=user_id,
        new_role=payload.role.value,
        current_admin_id=current_admin_id,
    )

    return ApiResponse.success(
        data=updated_user,
        message=ADMIN_MESSAGES["CHANGE_ROLE_SUCCESS"],
    )


def change_status_user(
    user_id: UUID,
    payload: AdminChangeStatusSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    user_payload = getattr(request.state, "user", {}) or {}
    current_admin_id = (
        UUID(user_payload.get("user_id")) if user_payload.get("user_id") else None
    )
    updated_user = admin_service.change_status_user(
        db=db,
        user_id=user_id,
        new_status=payload.status.value,
        current_admin_id=current_admin_id,
    )

    return ApiResponse.success(
        data=updated_user,
        message=ADMIN_MESSAGES["CHANGE_STATUS_SUCCESS"],
    )
