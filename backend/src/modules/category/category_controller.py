from uuid import UUID

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import CATEGORY_MESSAGES
from modules.category import category_service
from modules.category.category_validator import (
    CreateCategorySchema,
    UpdateCategorySchema,
    UpdateCategoryStatusSchema,
)
from utils.api_response import ApiResponse


def create(
    payload: CreateCategorySchema,
    db: Session = Depends(get_db),
):
    new_category = category_service.create(
        db=db,
        name=payload.name,
        description=payload.description,
        is_active=payload.is_active,
    )

    return ApiResponse.created(
        data=new_category,
        message=CATEGORY_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if is_active is not None:
        filters["is_active"] = is_active

    result = category_service.get_all(
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


def get_active_categories(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    categories = category_service.get_active_categories(
        db=db,
        search=search,
    )

    return ApiResponse.success(
        data=categories,
    )


def get_by_id(
    category_id: UUID,
    db: Session = Depends(get_db),
):
    category = category_service.get_by_id(
        db=db,
        category_id=category_id,
    )

    return ApiResponse.success(
        data=category,
    )


def update(
    category_id: UUID,
    payload: UpdateCategorySchema,
    db: Session = Depends(get_db),
):
    updated_category = category_service.update(
        db=db,
        category_id=category_id,
        name=payload.name,
        description=payload.description,
        is_active=payload.is_active,
    )

    return ApiResponse.success(
        data=updated_category,
        message=CATEGORY_MESSAGES["UPDATED"],
    )


def toggle_active(
    category_id: UUID,
    db: Session = Depends(get_db),
):
    updated_category = category_service.toggle_active(
        db=db,
        category_id=category_id,
    )

    return ApiResponse.success(
        data=updated_category,
        message=CATEGORY_MESSAGES["STATUS_UPDATED"],
    )


def update_status(
    category_id: UUID,
    payload: UpdateCategoryStatusSchema,
    db: Session = Depends(get_db),
):
    updated_category = category_service.update(
        db=db,
        category_id=category_id,
        is_active=payload.is_active,
    )

    return ApiResponse.success(
        data=updated_category,
        message=CATEGORY_MESSAGES["STATUS_UPDATED"],
    )


def delete(
    category_id: UUID,
    force: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    category_service.delete(
        db=db,
        category_id=category_id,
        force=force,
    )

    return ApiResponse.success(
        message=CATEGORY_MESSAGES["DELETED"],
    )
