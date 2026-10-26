from uuid import UUID

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.issue_statuses import ISSUE_STATUSES
from constants.messages import ISSUE_MESSAGES
from modules.issue import issue_service
from modules.issue.issue_validator import CreateIssueSchema
from utils.api_response import ApiResponse


def create(
    payload: CreateIssueSchema,
    db: Session = Depends(get_db),
):
    new_issue = issue_service.create(
        db=db,
        order_id=payload.order_id,
        warehouse_id=payload.warehouse_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        category_id=payload.category_id,
        note=payload.note,
    )

    return ApiResponse.created(
        data=new_issue,
        message=ISSUE_MESSAGES["CREATED"],
    )


def get_all(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    order_id: UUID | None = Query(default=None),
    product_id: UUID | None = Query(default=None),
    warehouse_id: UUID | None = Query(default=None),
    status: ISSUE_STATUSES | None = Query(default=None),
    db: Session = Depends(get_db),
):
    filters = {}
    if order_id is not None:
        filters["order_id"] = order_id
    if product_id is not None:
        filters["product_id"] = product_id
    if warehouse_id is not None:
        filters["warehouse_id"] = warehouse_id
    if status is not None:
        filters["status"] = status

    result = issue_service.get_all(
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
    issue_id: UUID,
    db: Session = Depends(get_db),
):
    issue = issue_service.get_by_id(
        db=db,
        issue_id=issue_id,
    )

    return ApiResponse.success(
        data=issue,
    )


def get_by_order_id(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    issues = issue_service.get_by_order_id(
        db=db,
        order_id=order_id,
    )

    return ApiResponse.success(
        data=issues,
    )


def cancel(
    issue_id: UUID,
    db: Session = Depends(get_db),
):
    cancelled_issue = issue_service.cancel(
        db=db,
        issue_id=issue_id,
    )

    return ApiResponse.success(
        data=cancelled_issue,
        message=ISSUE_MESSAGES["CANCELLED"],
    )
