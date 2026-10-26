from uuid import UUID

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import RECEIPT_MESSAGES
from constants.receipt_statuses import RECEIPT_STATUSES
from modules.receipt import receipt_service
from modules.receipt.receipt_validator import CreateReceiptSchema
from utils.api_response import ApiResponse


def create(
    payload: CreateReceiptSchema,
    db: Session = Depends(get_db),
):
    new_receipt = receipt_service.create(
        db=db,
        warehouse_id=payload.warehouse_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        supplier=payload.supplier,
        category_id=payload.category_id,
        location=payload.location,
        note=payload.note,
    )

    return ApiResponse.created(
        data=new_receipt,
        message=RECEIPT_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    product_id: UUID | None = Query(default=None),
    warehouse_id: UUID | None = Query(default=None),
    status: RECEIPT_STATUSES | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if product_id is not None:
        filters["product_id"] = product_id
    if warehouse_id is not None:
        filters["warehouse_id"] = warehouse_id
    if status is not None:
        filters["status"] = status

    result = receipt_service.get_all(
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
    receipt_id: UUID,
    db: Session = Depends(get_db),
):
    receipt = receipt_service.get_by_id(
        db=db,
        receipt_id=receipt_id,
    )

    return ApiResponse.success(
        data=receipt,
    )


def cancel(
    receipt_id: UUID,
    db: Session = Depends(get_db),
):
    cancelled_receipt = receipt_service.cancel(
        db=db,
        receipt_id=receipt_id,
    )

    return ApiResponse.success(
        data=cancelled_receipt,
        message=RECEIPT_MESSAGES["CANCELLED"],
    )
