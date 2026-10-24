import math
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import PRODUCT_MESSAGES
from constants.product_statuses import PRODUCT_STATUSES
from modules.category import category_repository
from modules.product import product_repository
from modules.product.product import Product
from utils.api_error import ApiError


def _validate_status(status: str | PRODUCT_STATUSES) -> PRODUCT_STATUSES:
    try:
        return PRODUCT_STATUSES(status)
    except ValueError:
        raise ApiError(400, PRODUCT_MESSAGES["INVALID_STATUS"]) from None


def create(
    db: Session,
    name: str,
    category_id: UUID,
    price: Decimal,
    description: str | None = None,
    short_description: str | None = None,
    status: str | PRODUCT_STATUSES = PRODUCT_STATUSES.ACTIVE,
) -> Product:
    if not name or not name.strip():
        raise ApiError(400, PRODUCT_MESSAGES["NAME_REQUIRED"])

    clean_name = name.strip()
    existing_product = product_repository.find_by_name(db, clean_name)
    if existing_product:
        raise ApiError(409, PRODUCT_MESSAGES["NAME_EXISTS"])

    category = category_repository.find_by_id(db, category_id)
    if not category:
        raise ApiError(404, PRODUCT_MESSAGES["CATEGORY_NOT_FOUND"])
    if not category.is_active:
        raise ApiError(400, PRODUCT_MESSAGES["CATEGORY_INACTIVE"])

    if price is None or price <= Decimal("0"):
        raise ApiError(400, PRODUCT_MESSAGES["INVALID_PRICE"])

    valid_status = _validate_status(status)

    new_product = product_repository.create(
        db=db,
        product_data={
            "name": clean_name,
            "category_id": category_id,
            "price": price,
            "description": description.strip() if description else None,
            "short_description": (
                short_description.strip() if short_description else None
            ),
            "status": valid_status,
        },
    )

    return new_product


def get_by_id(db: Session, product_id: UUID) -> Product:
    product = product_repository.find_by_id(db, product_id)
    if not product:
        raise ApiError(404, PRODUCT_MESSAGES["NOT_FOUND"])

    return product


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

    products = product_repository.find_all(
        db=db,
        filter=filters,
        search=search,
        skip=skip,
        limit=limit_number,
    )
    total_products = product_repository.count_all(
        db=db,
        filter=filters,
        search=search,
    )

    return {
        "data": products,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_products,
            "total_pages": math.ceil(total_products / limit_number)
            if total_products > 0
            else 0,
        },
    }


def get_active_products(
    db: Session,
    category_id: UUID | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    filters = {"status": PRODUCT_STATUSES.ACTIVE}
    if category_id:
        filters["category_id"] = category_id

    return get_all(
        db=db,
        filters=filters,
        search=search,
        page=page,
        limit=limit,
    )


def get_by_category_id(
    db: Session,
    category_id: UUID,
    skip: int = 0,
    limit: int = 10,
) -> list[Product]:
    category = category_repository.find_by_id(db, category_id)
    if not category:
        raise ApiError(404, PRODUCT_MESSAGES["CATEGORY_NOT_FOUND"])

    return product_repository.find_by_category_id(
        db=db,
        category_id=category_id,
        skip=skip,
        limit=limit,
    )


def update(
    db: Session,
    product_id: UUID,
    name: str | None = None,
    category_id: UUID | None = None,
    price: Decimal | None = None,
    description: str | None = None,
    short_description: str | None = None,
    status: str | PRODUCT_STATUSES | None = None,
) -> Product:
    product = product_repository.find_by_id(db, product_id)
    if not product:
        raise ApiError(404, PRODUCT_MESSAGES["NOT_FOUND"])

    update_data = {}

    if name is not None:
        clean_name = name.strip()
        if not clean_name:
            raise ApiError(400, PRODUCT_MESSAGES["NAME_REQUIRED"])

        existing_product = product_repository.find_by_name(db, clean_name)
        if existing_product and existing_product.id != product_id:
            raise ApiError(409, PRODUCT_MESSAGES["NAME_EXISTS"])

        update_data["name"] = clean_name

    if category_id is not None:
        category = category_repository.find_by_id(db, category_id)
        if not category:
            raise ApiError(404, PRODUCT_MESSAGES["CATEGORY_NOT_FOUND"])
        if not category.is_active:
            raise ApiError(400, PRODUCT_MESSAGES["CATEGORY_INACTIVE"])

        update_data["category_id"] = category_id

    if price is not None:
        if price <= Decimal("0"):
            raise ApiError(400, PRODUCT_MESSAGES["INVALID_PRICE"])
        update_data["price"] = price

    if description is not None:
        update_data["description"] = description.strip() if description else None

    if short_description is not None:
        update_data["short_description"] = (
            short_description.strip() if short_description else None
        )

    if status is not None:
        valid_status = _validate_status(status)
        update_data["status"] = valid_status

    if not update_data:
        raise ApiError(400, PRODUCT_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

    updated_product = product_repository.update_by_id(
        db=db,
        product_id=product_id,
        product_data=update_data,
    )
    if not updated_product:
        raise ApiError(404, PRODUCT_MESSAGES["NOT_FOUND"])

    return updated_product


def change_status(
    db: Session,
    product_id: UUID,
    status: str | PRODUCT_STATUSES,
) -> Product:
    product = product_repository.find_by_id(db, product_id)
    if not product:
        raise ApiError(404, PRODUCT_MESSAGES["NOT_FOUND"])

    valid_status = _validate_status(status)

    if valid_status == PRODUCT_STATUSES.ACTIVE:
        category = category_repository.find_by_id(db, product.category_id)
        if category and not category.is_active:
            raise ApiError(400, PRODUCT_MESSAGES["CATEGORY_INACTIVE"])

    updated_product = product_repository.update_by_id(
        db=db,
        product_id=product_id,
        product_data={"status": valid_status},
    )
    return updated_product


def discontinue(db: Session, product_id: UUID) -> Product:
    return change_status(db, product_id, PRODUCT_STATUSES.INACTIVE)


def activate(db: Session, product_id: UUID) -> Product:
    return change_status(db, product_id, PRODUCT_STATUSES.ACTIVE)


def mark_as_draft(db: Session, product_id: UUID) -> Product:
    return change_status(db, product_id, PRODUCT_STATUSES.DRAFT)


def delete(db: Session, product_id: UUID) -> bool:
    product = product_repository.find_by_id(db, product_id)
    if not product:
        raise ApiError(404, PRODUCT_MESSAGES["NOT_FOUND"])

    return product_repository.delete_by_id(db, product_id)
