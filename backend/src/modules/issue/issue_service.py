import math
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from constants.issue_statuses import ISSUE_STATUSES
from constants.messages import ISSUE_MESSAGES
from modules.inventory import inventory_service
from modules.issue import issue_repository
from modules.issue.issue import Issue
from modules.product import product_service
from modules.warehouse import warehouse_service
from utils.api_error import ApiError


def create(
    db: Session,
    order_id: UUID,
    warehouse_id: UUID,
    product_id: UUID,
    quantity: int,
    category_id: UUID | None = None,
    note: str | None = None,
) -> Issue:
    if quantity is None or quantity <= 0:
        raise ApiError(400, ISSUE_MESSAGES["INVALID_QUANTITY"])

    warehouse_service.get_by_id(db, warehouse_id, check_active=True)
    product = product_service.get_by_id(db, product_id)

    if category_id is None:
        category_id = getattr(product, "category_id", None)

    inventory = inventory_service.get_by_product_id(db, product_id)
    if inventory.quantity < quantity:
        raise ApiError(400, ISSUE_MESSAGES["INSUFFICIENT_STOCK"])

    inventory_service.adjust_stock(db, product_id=product_id, delta=-quantity)

    new_issue = issue_repository.create(
        db=db,
        issue_data={
            "order_id": order_id,
            "warehouse_id": warehouse_id,
            "product_id": product_id,
            "category_id": category_id,
            "quantity": quantity,
            "issued_at": datetime.now(UTC),
            "status": ISSUE_STATUSES.COMPLETED,
            "note": note.strip() if note else None,
        },
    )

    return new_issue


def get_by_id(db: Session, issue_id: UUID) -> Issue:
    issue = issue_repository.find_by_id(db, issue_id)
    if not issue:
        raise ApiError(404, ISSUE_MESSAGES["NOT_FOUND"])

    return issue


def get_by_order_id(db: Session, order_id: UUID) -> list[Issue]:
    return issue_repository.find_by_order_id(db, order_id)


def get_all(
    db: Session,
    filters: dict | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    if filters is None:
        filters = {}

    page_number = max(1, int(page))
    limit_number = max(1, int(limit))
    skip = (page_number - 1) * limit_number

    issues = issue_repository.find_all(
        db=db,
        filter=filters,
        search=search,
        skip=skip,
        limit=limit_number,
    )
    total_issues = issue_repository.count_all(
        db=db,
        filter=filters,
        search=search,
    )

    return {
        "data": issues,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_issues,
            "total_pages": (
                math.ceil(total_issues / limit_number) if total_issues > 0 else 0
            ),
        },
    }


def cancel(db: Session, issue_id: UUID) -> Issue:
    issue = get_by_id(db, issue_id)

    if issue.status == ISSUE_STATUSES.CANCELLED:
        raise ApiError(400, ISSUE_MESSAGES["ALREADY_CANCELLED"])

    inventory_service.adjust_stock(
        db=db,
        product_id=issue.product_id,
        delta=issue.quantity,
    )

    updated_issue = issue_repository.update_by_id(
        db=db,
        issue_id=issue_id,
        issue_data={"status": ISSUE_STATUSES.CANCELLED},
    )
    if not updated_issue:
        raise ApiError(404, ISSUE_MESSAGES["NOT_FOUND"])

    return updated_issue
