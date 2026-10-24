import math
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import CATEGORY_MESSAGES
from modules.category import category_repository
from modules.category.category import Category
from modules.product import product_repository
from utils.api_error import ApiError


def create(
    db: Session,
    name: str,
    description: str | None = None,
    is_active: bool = True,
) -> Category:
    if not name or not name.strip():
        raise ApiError(400, CATEGORY_MESSAGES["NAME_REQUIRED"])

    clean_name = name.strip()
    existing_category = category_repository.find_by_name(db, clean_name)
    if existing_category:
        raise ApiError(409, CATEGORY_MESSAGES["NAME_EXISTS"])

    new_category = category_repository.create(
        db=db,
        category_data={
            "name": clean_name,
            "description": description.strip() if description else None,
            "is_active": is_active,
        },
    )

    return new_category


def get_by_id(db: Session, category_id: UUID) -> Category:
    category = category_repository.find_by_id(db, category_id)
    if not category:
        raise ApiError(404, CATEGORY_MESSAGES["NOT_FOUND"])

    return category


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

    categories = category_repository.find_all(
        db,
        filter=filters,
        search=search,
        skip=skip,
        limit=limit_number,
    )

    total_categories = category_repository.count_all(
        db,
        filter=filters,
        search=search,
    )

    return {
        "data": categories,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_categories,
            "total_pages": math.ceil(total_categories / limit_number)
            if total_categories > 0
            else 0,
        },
    }


def get_active_categories(
    db: Session,
    search: str | None = None,
) -> list[Category]:
    return category_repository.find_all(
        db,
        filter={"is_active": True},
        search=search,
        skip=0,
        limit=1000,
    )


def update(
    db: Session,
    category_id: UUID,
    name: str | None = None,
    description: str | None = None,
    is_active: bool | None = None,
) -> Category:
    category = category_repository.find_by_id(db, category_id)
    if not category:
        raise ApiError(404, CATEGORY_MESSAGES["NOT_FOUND"])

    update_data = {}

    if name is not None:
        clean_name = name.strip()
        if not clean_name:
            raise ApiError(400, CATEGORY_MESSAGES["NAME_REQUIRED"])

        existing_category = category_repository.find_by_name(db, clean_name)
        if existing_category and existing_category.id != category_id:
            raise ApiError(409, CATEGORY_MESSAGES["NAME_EXISTS"])

        update_data["name"] = clean_name

    if description is not None:
        update_data["description"] = description.strip() if description else None

    if is_active is not None:
        update_data["is_active"] = is_active

    if not update_data:
        raise ApiError(400, CATEGORY_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

    updated_category = category_repository.update_by_id(db, category_id, update_data)
    if not updated_category:
        raise ApiError(404, CATEGORY_MESSAGES["NOT_FOUND"])

    return updated_category


def toggle_active(db: Session, category_id: UUID) -> Category:
    category = category_repository.find_by_id(db, category_id)
    if not category:
        raise ApiError(404, CATEGORY_MESSAGES["NOT_FOUND"])

    new_status = not category.is_active
    updated_category = category_repository.update_by_id(
        db, category_id, {"is_active": new_status}
    )
    return updated_category


def hide(db: Session, category_id: UUID) -> Category:
    category = category_repository.find_by_id(db, category_id)
    if not category:
        raise ApiError(404, CATEGORY_MESSAGES["NOT_FOUND"])

    updated_category = category_repository.update_by_id(
        db, category_id, {"is_active": False}
    )
    return updated_category


def activate(db: Session, category_id: UUID) -> Category:
    category = category_repository.find_by_id(db, category_id)
    if not category:
        raise ApiError(404, CATEGORY_MESSAGES["NOT_FOUND"])

    updated_category = category_repository.update_by_id(
        db, category_id, {"is_active": True}
    )
    return updated_category


def delete(db: Session, category_id: UUID, force: bool = False) -> bool:
    category = category_repository.find_by_id(db, category_id)
    if not category:
        raise ApiError(404, CATEGORY_MESSAGES["NOT_FOUND"])

    linked_products = product_repository.find_by_category_id(db, category_id, limit=1)
    if linked_products and not force:
        raise ApiError(400, CATEGORY_MESSAGES["HAS_PRODUCTS"])

    return category_repository.delete_by_id(db, category_id)
