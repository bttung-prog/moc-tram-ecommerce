import math
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import INVENTORY_MESSAGES
from modules.inventory import inventory_repository
from modules.inventory.inventory import Inventory
from modules.product import product_service
from modules.warehouse import warehouse_service
from utils.api_error import ApiError


def create(
    db: Session,
    warehouse_id: UUID,
    product_id: UUID,
    quantity: int,
    location: str,
) -> Inventory:
    warehouse_service.get_by_id(db, warehouse_id, check_active=True)
    product_service.get_by_id(db, product_id)

    existing_inventory = inventory_repository.find_by_product_id(db, product_id)
    if existing_inventory:
        raise ApiError(409, INVENTORY_MESSAGES["PRODUCT_ALREADY_EXISTS"])

    if quantity is None or quantity < 0:
        raise ApiError(400, INVENTORY_MESSAGES["INVALID_QUANTITY"])

    if not location or not location.strip():
        raise ApiError(400, INVENTORY_MESSAGES["INVALID_LOCATION"])

    clean_location = location.strip()

    new_inventory = inventory_repository.create(
        db=db,
        inventory_data={
            "warehouse_id": warehouse_id,
            "product_id": product_id,
            "quantity": quantity,
            "location": clean_location,
        },
    )

    return new_inventory


def get_by_id(db: Session, inventory_id: UUID) -> Inventory:
    inventory = inventory_repository.find_by_id(db, inventory_id)
    if not inventory:
        raise ApiError(404, INVENTORY_MESSAGES["NOT_FOUND"])

    return inventory


def get_by_product_id(db: Session, product_id: UUID) -> Inventory:
    product_service.get_by_id(db, product_id)

    inventory = inventory_repository.find_by_product_id(db, product_id)
    if not inventory:
        raise ApiError(404, INVENTORY_MESSAGES["NOT_FOUND"])

    return inventory


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

    inventories = inventory_repository.find_all(
        db=db,
        filter=filters,
        search=search,
        skip=skip,
        limit=limit_number,
    )
    total_inventories = inventory_repository.count_all(
        db=db,
        filter=filters,
        search=search,
    )

    return {
        "data": inventories,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_inventories,
            "total_pages": (
                math.ceil(total_inventories / limit_number)
                if total_inventories > 0
                else 0
            ),
        },
    }


def update(
    db: Session,
    inventory_id: UUID,
    quantity: int | None = None,
    location: str | None = None,
) -> Inventory:
    inventory = inventory_repository.find_by_id(db, inventory_id)
    if not inventory:
        raise ApiError(404, INVENTORY_MESSAGES["NOT_FOUND"])

    update_data = {}

    if quantity is not None:
        if quantity < 0:
            raise ApiError(400, INVENTORY_MESSAGES["INVALID_QUANTITY"])
        update_data["quantity"] = quantity

    if location is not None:
        clean_location = location.strip()
        if not clean_location:
            raise ApiError(400, INVENTORY_MESSAGES["INVALID_LOCATION"])
        update_data["location"] = clean_location

    if not update_data:
        raise ApiError(400, INVENTORY_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

    updated_inventory = inventory_repository.update_by_id(
        db=db,
        inventory_id=inventory_id,
        inventory_data=update_data,
    )
    if not updated_inventory:
        raise ApiError(404, INVENTORY_MESSAGES["NOT_FOUND"])

    return updated_inventory


def adjust_stock(
    db: Session,
    product_id: UUID,
    delta: int,
) -> Inventory:
    product_service.get_by_id(db, product_id)

    inventory = inventory_repository.find_by_product_id(db, product_id)
    if not inventory:
        raise ApiError(404, INVENTORY_MESSAGES["NOT_FOUND"])

    new_quantity = inventory.quantity + delta
    if new_quantity < 0:
        raise ApiError(400, INVENTORY_MESSAGES["INSUFFICIENT_STOCK"])

    updated_inventory = inventory_repository.update_by_id(
        db=db,
        inventory_id=inventory.id,
        inventory_data={"quantity": new_quantity},
    )
    if not updated_inventory:
        raise ApiError(404, INVENTORY_MESSAGES["NOT_FOUND"])

    return updated_inventory


def delete(db: Session, inventory_id: UUID) -> bool:
    inventory = inventory_repository.find_by_id(db, inventory_id)
    if not inventory:
        raise ApiError(404, INVENTORY_MESSAGES["NOT_FOUND"])

    if inventory.quantity > 0:
        raise ApiError(400, INVENTORY_MESSAGES["CANNOT_DELETE_NON_ZERO"])

    return inventory_repository.delete_by_id(db, inventory_id)
