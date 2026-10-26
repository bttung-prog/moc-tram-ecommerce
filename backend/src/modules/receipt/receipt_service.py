import math
from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import RECEIPT_MESSAGES
from constants.receipt_statuses import RECEIPT_STATUSES
from modules.inventory import inventory_service
from modules.product import product_service
from modules.receipt import receipt_repository
from modules.receipt.receipt import Receipt
from modules.warehouse import warehouse_service
from utils.api_error import ApiError


def create(
    db: Session,
    warehouse_id: UUID,
    product_id: UUID,
    quantity: int,
    unit_price: Decimal | None = None,
    supplier: str | None = None,
    category_id: UUID | None = None,
    location: str | None = None,
    note: str | None = None,
) -> Receipt:
    if quantity is None or quantity <= 0:
        raise ApiError(400, RECEIPT_MESSAGES["INVALID_QUANTITY"])

    warehouse_service.get_by_id(db, warehouse_id, check_active=True)
    product = product_service.get_by_id(db, product_id)

    if category_id is None:
        category_id = getattr(product, "category_id", None)

    try:
        inventory_service.get_by_product_id(db, product_id)
        inventory_service.adjust_stock(db, product_id=product_id, delta=quantity)
    except ApiError as e:
        if e.status_code == 404:
            inventory_service.create(
                db=db,
                warehouse_id=warehouse_id,
                product_id=product_id,
                quantity=quantity,
                location=location.strip()
                if location and location.strip()
                else "Khu vực nhập hàng",
            )
        else:
            raise e

    new_receipt = receipt_repository.create(
        db=db,
        receipt_data={
            "warehouse_id": warehouse_id,
            "product_id": product_id,
            "category_id": category_id,
            "supplier": supplier.strip() if supplier else None,
            "quantity": quantity,
            "unit_price": unit_price,
            "received_at": datetime.now(UTC),
            "status": RECEIPT_STATUSES.COMPLETED,
            "note": note.strip() if note else None,
        },
    )

    return new_receipt


def get_by_id(db: Session, receipt_id: UUID) -> Receipt:
    receipt = receipt_repository.find_by_id(db, receipt_id)
    if not receipt:
        raise ApiError(404, RECEIPT_MESSAGES["NOT_FOUND"])

    return receipt


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

    receipts = receipt_repository.find_all(
        db=db,
        filter=filters,
        search=search,
        skip=skip,
        limit=limit_number,
    )
    total_receipts = receipt_repository.count_all(
        db=db,
        filter=filters,
        search=search,
    )

    return {
        "data": receipts,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_receipts,
            "total_pages": (
                math.ceil(total_receipts / limit_number) if total_receipts > 0 else 0
            ),
        },
    }


def cancel(db: Session, receipt_id: UUID) -> Receipt:
    receipt = get_by_id(db, receipt_id)

    if receipt.status == RECEIPT_STATUSES.CANCELLED:
        raise ApiError(400, RECEIPT_MESSAGES["ALREADY_CANCELLED"])

    inventory = inventory_service.get_by_product_id(db, receipt.product_id)
    if inventory.quantity < receipt.quantity:
        raise ApiError(400, RECEIPT_MESSAGES["INSUFFICIENT_STOCK_TO_CANCEL"])

    inventory_service.adjust_stock(
        db=db,
        product_id=receipt.product_id,
        delta=-receipt.quantity,
    )

    updated_receipt = receipt_repository.update_by_id(
        db=db,
        receipt_id=receipt_id,
        receipt_data={"status": RECEIPT_STATUSES.CANCELLED},
    )
    if not updated_receipt:
        raise ApiError(404, RECEIPT_MESSAGES["NOT_FOUND"])

    return updated_receipt
