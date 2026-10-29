import math
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import STAFF_MESSAGES
from constants.roles import ROLES
from modules.staff import staff_repository
from modules.staff.staff import Staff
from modules.user import user_service
from utils.api_error import ApiError
from utils.generate_code import generate_staff_code


def generate_unique_staff_code(db: Session, max_attempts: int = 10) -> str:
    for _ in range(max_attempts):
        code = generate_staff_code("STF", 6)
        if not staff_repository.find_by_staff_code(db, code):
            return code
    return generate_staff_code("STF", 6)


def create(
    db: Session,
    user_id: UUID,
    department: str | None = None,
    position: str | None = None,
    is_active: bool = True,
) -> Staff:
    user = user_service.get_by_id(db, user_id)

    if user.role != ROLES.STAFF and user.role != ROLES.STAFF.value:
        raise ApiError(400, STAFF_MESSAGES["USER_NOT_STAFF"])

    existing_staff = staff_repository.find_by_user_id(db, user_id)
    if existing_staff:
        raise ApiError(409, STAFF_MESSAGES["ALREADY_EXISTS"])

    staff_code = generate_unique_staff_code(db)

    clean_department = (
        department.strip() if department and department.strip() else "CSKH"
    )
    clean_position = (
        position.strip() if position and position.strip() else "Nhân viên tư vấn"
    )

    new_staff = staff_repository.create(
        db=db,
        staff_data={
            "user_id": user_id,
            "staff_code": staff_code,
            "department": clean_department,
            "position": clean_position,
            "is_active": is_active,
        },
    )

    return new_staff


def get_or_create_by_user_id(db: Session, user_id: UUID) -> Staff:
    staff = staff_repository.find_by_user_id(db, user_id)
    if staff:
        return staff

    user_service.get_by_id(db, user_id)

    return staff_repository.create(
        db=db,
        staff_data={
            "user_id": user_id,
            "staff_code": generate_unique_staff_code(db),
            "department": "CSKH",
            "position": "Nhân viên tư vấn",
            "is_active": True,
        },
    )


def activate_by_user_id(db: Session, user_id: UUID) -> Staff:
    staff = staff_repository.find_by_user_id(db, user_id)
    if not staff:
        return get_or_create_by_user_id(db, user_id)

    if not staff.is_active or staff.deleted_at is not None:
        staff.is_active = True
        staff.deleted_at = None
        db.flush()
        db.refresh(staff)

    return staff


def deactivate_by_user_id(db: Session, user_id: UUID) -> Staff | None:
    staff = staff_repository.find_by_user_id(db, user_id)
    if not staff:
        return None

    if staff.is_active or staff.deleted_at is None:
        staff_repository.delete_by_id(db, staff.id)

    return staff


def get_by_id(db: Session, staff_id: UUID) -> Staff:
    staff = staff_repository.find_by_id(db, staff_id)
    if not staff:
        raise ApiError(404, STAFF_MESSAGES["NOT_FOUND"])

    return staff


def get_by_user_id(db: Session, user_id: UUID) -> Staff:
    staff = staff_repository.find_by_user_id(db, user_id)
    if not staff:
        raise ApiError(404, STAFF_MESSAGES["NOT_FOUND"])

    return staff


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

    staff_list = staff_repository.find_all(
        db=db,
        filter=filters,
        search=search,
        skip=skip,
        limit=limit_number,
    )
    total_staff = staff_repository.count_all(
        db=db,
        filter=filters,
        search=search,
    )

    return {
        "data": staff_list,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_staff,
            "total_pages": (
                math.ceil(total_staff / limit_number) if total_staff > 0 else 0
            ),
        },
    }


def update(
    db: Session,
    staff_id: UUID,
    department: str | None = None,
    position: str | None = None,
) -> Staff:
    staff = get_by_id(db, staff_id)

    update_data = {}

    if department is not None:
        clean_dept = department.strip()
        if clean_dept:
            update_data["department"] = clean_dept

    if position is not None:
        clean_pos = position.strip()
        if clean_pos:
            update_data["position"] = clean_pos

    if not update_data:
        return staff

    updated_staff = staff_repository.update_by_id(
        db=db,
        staff_id=staff_id,
        staff_data=update_data,
    )
    if not updated_staff:
        raise ApiError(404, STAFF_MESSAGES["NOT_FOUND"])

    return updated_staff


def delete(db: Session, staff_id: UUID) -> bool:
    staff = get_by_id(db, staff_id)
    if not staff.is_active or staff.deleted_at is not None:
        raise ApiError(400, STAFF_MESSAGES["ALREADY_DEACTIVATED"])

    return staff_repository.delete_by_id(db, staff.id)


def restore(db: Session, staff_id: UUID) -> Staff:
    staff = get_by_id(db, staff_id)
    if staff.is_active and staff.deleted_at is None:
        return staff

    restored_staff = staff_repository.restore_by_id(db, staff_id)
    if not restored_staff:
        raise ApiError(404, STAFF_MESSAGES["NOT_FOUND"])

    return restored_staff
