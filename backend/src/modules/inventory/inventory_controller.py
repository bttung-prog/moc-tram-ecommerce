from uuid import UUID

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import INVENTORY_MESSAGES
from modules.inventory import inventory_service
from modules.inventory.inventory_validator import (
    AdjustStockSchema,
    CreateInventorySchema,
    UpdateInventorySchema,
)
from utils.api_response import ApiResponse


def create(
    payload: CreateInventorySchema,
    db: Session = Depends(get_db),
):
    new_inventory = inventory_service.create(
        db=db,
        warehouse_id=payload.warehouse_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        location=payload.location,
    )

    return ApiResponse.created(
        data=new_inventory,
        message=INVENTORY_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    warehouse_id: UUID | None = Query(default=None),
    product_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if warehouse_id is not None:
        filters["warehouse_id"] = warehouse_id
    if product_id is not None:
        filters["product_id"] = product_id

    result = inventory_service.get_all(
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


def get_by_id(
    inventory_id: UUID,
    db: Session = Depends(get_db),
):
    inventory = inventory_service.get_by_id(
        db=db,
        inventory_id=inventory_id,
    )

    return ApiResponse.success(
        data=inventory,
    )


def get_by_product_id(
    product_id: UUID,
    db: Session = Depends(get_db),
):
    inventory = inventory_service.get_by_product_id(
        db=db,
        product_id=product_id,
    )

    return ApiResponse.success(
        data=inventory,
    )


def update(
    inventory_id: UUID,
    payload: UpdateInventorySchema,
    db: Session = Depends(get_db),
):
    updated_inventory = inventory_service.update(
        db=db,
        inventory_id=inventory_id,
        quantity=payload.quantity,
        location=payload.location,
    )

    return ApiResponse.success(
        data=updated_inventory,
        message=INVENTORY_MESSAGES["UPDATED"],
    )


def adjust_stock(
    product_id: UUID,
    payload: AdjustStockSchema,
    db: Session = Depends(get_db),
):
    updated_inventory = inventory_service.adjust_stock(
        db=db,
        product_id=product_id,
        delta=payload.delta,
    )

    return ApiResponse.success(
        data=updated_inventory,
        message=INVENTORY_MESSAGES["UPDATED"],
    )


def delete(
    inventory_id: UUID,
    db: Session = Depends(get_db),
):
    inventory_service.delete(
        db=db,
        inventory_id=inventory_id,
    )

    return ApiResponse.success(
        message=INVENTORY_MESSAGES["DELETED"],
    )
