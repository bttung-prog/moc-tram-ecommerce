from uuid import UUID

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import PRODUCT_MESSAGES
from constants.product_statuses import PRODUCT_STATUSES
from modules.product import product_service
from modules.product.product_validator import (
    CreateProductSchema,
    UpdateProductSchema,
    UpdateProductStatusSchema,
)
from utils.api_response import ApiResponse


def create(
    payload: CreateProductSchema,
    db: Session = Depends(get_db),
):
    new_product = product_service.create(
        db=db,
        name=payload.name,
        category_id=payload.category_id,
        price=payload.price,
        description=payload.description,
        short_description=payload.short_description,
        status=payload.status,
    )

    return ApiResponse.created(
        data=new_product,
        message=PRODUCT_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    category_id: UUID | None = Query(default=None),
    status: PRODUCT_STATUSES | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if category_id is not None:
        filters["category_id"] = category_id
    if status is not None:
        filters["status"] = status

    result = product_service.get_all(
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


def get_active_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    category_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    result = product_service.get_active_products(
        db=db,
        category_id=category_id,
        search=search,
        page=page,
        limit=limit,
    )

    return ApiResponse.success(
        data=result["data"],
        meta=result["pagination"],
    )


def get_by_id(
    product_id: UUID,
    db: Session = Depends(get_db),
):
    product = product_service.get_by_id(
        db=db,
        product_id=product_id,
    )

    return ApiResponse.success(
        data=product,
    )


def get_by_category_id(
    category_id: UUID,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * limit
    products = product_service.get_by_category_id(
        db=db,
        category_id=category_id,
        skip=skip,
        limit=limit,
    )

    return ApiResponse.success(
        data=products,
    )


def update(
    product_id: UUID,
    payload: UpdateProductSchema,
    db: Session = Depends(get_db),
):
    updated_product = product_service.update(
        db=db,
        product_id=product_id,
        name=payload.name,
        category_id=payload.category_id,
        price=payload.price,
        description=payload.description,
        short_description=payload.short_description,
        status=payload.status,
    )

    return ApiResponse.success(
        data=updated_product,
        message=PRODUCT_MESSAGES["UPDATED"],
    )


def update_status(
    product_id: UUID,
    payload: UpdateProductStatusSchema,
    db: Session = Depends(get_db),
):
    updated_product = product_service.change_status(
        db=db,
        product_id=product_id,
        status=payload.status,
    )

    return ApiResponse.success(
        data=updated_product,
        message=PRODUCT_MESSAGES["STATUS_UPDATED"],
    )


def discontinue(
    product_id: UUID,
    db: Session = Depends(get_db),
):
    updated_product = product_service.discontinue(
        db=db,
        product_id=product_id,
    )

    return ApiResponse.success(
        data=updated_product,
        message=PRODUCT_MESSAGES["DISCONTINUED"],
    )


def activate(
    product_id: UUID,
    db: Session = Depends(get_db),
):
    updated_product = product_service.activate(
        db=db,
        product_id=product_id,
    )

    return ApiResponse.success(
        data=updated_product,
        message=PRODUCT_MESSAGES["STATUS_UPDATED"],
    )


def delete(
    product_id: UUID,
    db: Session = Depends(get_db),
):
    product_service.delete(
        db=db,
        product_id=product_id,
    )

    return ApiResponse.success(
        message=PRODUCT_MESSAGES["DELETED"],
    )
