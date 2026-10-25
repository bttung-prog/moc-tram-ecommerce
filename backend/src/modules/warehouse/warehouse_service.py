import math
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import WAREHOUSE_MESSAGES
from constants.warehouse_statuses import WAREHOUSE_STATUSES
from modules.warehouse import warehouse_repository
from modules.warehouse.warehouse import Warehouse
from utils.api_error import ApiError


def _validate_status(status: str | WAREHOUSE_STATUSES) -> WAREHOUSE_STATUSES:
    try:
        return WAREHOUSE_STATUSES(status)
    except ValueError:
        raise ApiError(400, WAREHOUSE_MESSAGES["INVALID_STATUS"]) from None


def create(
    db: Session,
    name: str,
    address: str,
    status: str | WAREHOUSE_STATUSES = WAREHOUSE_STATUSES.ACTIVE,
) -> Warehouse:
    if not name or not name.strip():
        raise ApiError(400, WAREHOUSE_MESSAGES["NAME_REQUIRED"])

    if not address or not address.strip():
        raise ApiError(400, WAREHOUSE_MESSAGES["ADDRESS_REQUIRED"])

    clean_name = name.strip()
    clean_address = address.strip()

    existing_warehouse = warehouse_repository.find_by_name(db, clean_name)
    if existing_warehouse:
        raise ApiError(409, WAREHOUSE_MESSAGES["NAME_EXISTS"])

    valid_status = _validate_status(status)

    new_warehouse = warehouse_repository.create(
        db=db,
        warehouse_data={
            "name": clean_name,
            "address": clean_address,
            "status": valid_status,
        },
    )

    return new_warehouse


def get_by_id(
    db: Session,
    warehouse_id: UUID,
    check_active: bool = True,
) -> Warehouse:
    warehouse = warehouse_repository.find_by_id(db, warehouse_id)
    if not warehouse:
        raise ApiError(404, WAREHOUSE_MESSAGES["NOT_FOUND"])

    if check_active and warehouse.status != WAREHOUSE_STATUSES.ACTIVE:
        raise ApiError(400, WAREHOUSE_MESSAGES["INACTIVE"])

    return warehouse


def get_all(
    db: Session,
    filters: dict | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 10,
    include_deleted: bool = False,
) -> dict:
    if filters is None:
        filters = {}

    page_number = max(1, int(page))
    limit_number = max(1, int(limit))
    skip = (page_number - 1) * limit_number

    warehouses = warehouse_repository.find_all(
        db=db,
        filter=filters,
        search=search,
        skip=skip,
        limit=limit_number,
        include_deleted=include_deleted,
    )

    total_warehouses = warehouse_repository.count_all(
        db=db,
        filter=filters,
        search=search,
        include_deleted=include_deleted,
    )

    return {
        "data": warehouses,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_warehouses,
            "total_pages": math.ceil(total_warehouses / limit_number)
            if total_warehouses > 0
            else 0,
        },
    }


def get_active(
    db: Session,
    skip: int = 0,
    limit: int | None = None,
) -> list[Warehouse]:
    return warehouse_repository.find_active(db, skip=skip, limit=limit)


def update(
    db: Session,
    warehouse_id: UUID,
    name: str | None = None,
    address: str | None = None,
    status: str | WAREHOUSE_STATUSES | None = None,
) -> Warehouse:
    warehouse = warehouse_repository.find_by_id(db, warehouse_id)
    if not warehouse:
        raise ApiError(404, WAREHOUSE_MESSAGES["NOT_FOUND"])

    update_data = {}

    if name is not None:
        clean_name = name.strip()
        if not clean_name:
            raise ApiError(400, WAREHOUSE_MESSAGES["NAME_REQUIRED"])

        existing = warehouse_repository.find_by_name(db, clean_name)
        if existing and existing.id != warehouse_id:
            raise ApiError(409, WAREHOUSE_MESSAGES["NAME_EXISTS"])

        update_data["name"] = clean_name

    if address is not None:
        clean_address = address.strip()
        if not clean_address:
            raise ApiError(400, WAREHOUSE_MESSAGES["ADDRESS_REQUIRED"])
        update_data["address"] = clean_address

    if status is not None:
        update_data["status"] = _validate_status(status)

    if not update_data:
        raise ApiError(400, WAREHOUSE_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

    updated_warehouse = warehouse_repository.update_by_id(db, warehouse_id, update_data)
    if not updated_warehouse:
        raise ApiError(404, WAREHOUSE_MESSAGES["NOT_FOUND"])

    return updated_warehouse


def change_status(
    db: Session,
    warehouse_id: UUID,
    status: str | WAREHOUSE_STATUSES,
) -> Warehouse:
    warehouse = warehouse_repository.find_by_id(db, warehouse_id)
    if not warehouse:
        raise ApiError(404, WAREHOUSE_MESSAGES["NOT_FOUND"])

    valid_status = _validate_status(status)
    updated_warehouse = warehouse_repository.update_by_id(
        db, warehouse_id, {"status": valid_status}
    )
    return updated_warehouse


def delete(db: Session, warehouse_id: UUID) -> bool:
    warehouse = warehouse_repository.find_by_id(db, warehouse_id)
    if not warehouse:
        raise ApiError(404, WAREHOUSE_MESSAGES["NOT_FOUND"])

    return warehouse_repository.delete_by_id(db, warehouse_id)


def restore(db: Session, warehouse_id: UUID) -> Warehouse:
    warehouse = warehouse_repository.restore_by_id(db, warehouse_id)
    if not warehouse:
        raise ApiError(404, WAREHOUSE_MESSAGES["NOT_FOUND"])

    return warehouse
