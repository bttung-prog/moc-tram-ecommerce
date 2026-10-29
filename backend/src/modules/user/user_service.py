import math
from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import ADMIN_MESSAGES, COMMON_MESSAGES, USER_MESSAGES
from constants.roles import ROLES
from constants.user_statuses import USER_STATUSES
from modules.user import user_repository
from modules.user.user import User
from utils.api_error import ApiError
from utils.password import hash_password


def create(
    db: Session,
    email: str,
    password: str,
    phone: str,
    full_name: str,
    role: str = ROLES.CUSTOMER.value,
    status: str = USER_STATUSES.ACTIVE.value,
):
    if not email or not password or not phone or not full_name or not role:
        raise ApiError(
            status_code=400,
            message=COMMON_MESSAGES["ALL_FIELDS_REQUIRED"],
        )

    clean_email = email.strip().lower()
    clean_phone = phone.strip()
    clean_full_name = full_name.strip()
    clean_password = password.strip()

    existing_email = user_repository.find_by_email(db, clean_email)
    if existing_email:
        raise ApiError(409, USER_MESSAGES["EMAIL_EXISTS"])

    existing_phone = user_repository.find_by_phone(db, clean_phone)
    if existing_phone:
        raise ApiError(409, USER_MESSAGES["PHONE_EXISTS"])

    hashed_password = hash_password(clean_password)

    new_user = user_repository.create(
        db=db,
        user_data={
            "email": clean_email,
            "password": hashed_password,
            "phone": clean_phone,
            "full_name": clean_full_name,
            "role": role,
            "status": status,
        },
    )

    is_profile_active = (
        status == USER_STATUSES.ACTIVE.value or status == USER_STATUSES.ACTIVE
    )

    if role == ROLES.CUSTOMER or role == ROLES.CUSTOMER.value:
        from modules.customer import customer_service

        customer_service.create(
            db=db,
            user_id=new_user.id,
            is_active=is_profile_active,
        )
    elif role == ROLES.STAFF or role == ROLES.STAFF.value:
        from modules.staff import staff_service

        staff_service.create(
            db=db,
            user_id=new_user.id,
            is_active=is_profile_active,
        )
    elif role == ROLES.WAREHOUSE_STAFF or role == ROLES.WAREHOUSE_STAFF.value:
        from modules.warehouse_staff import warehouse_staff_service

        warehouse_staff_service.create(
            db=db,
            user_id=new_user.id,
            is_active=is_profile_active,
        )

    return new_user


def activate_user(db: Session, user_id: UUID) -> User:
    user = user_repository.update_by_id(
        db, user_id, {"status": USER_STATUSES.ACTIVE.value}
    )

    if not user:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    if user.role == ROLES.CUSTOMER or user.role == ROLES.CUSTOMER.value:
        from modules.customer import customer_service

        customer_service.activate_by_user_id(db, user.id)
    elif user.role == ROLES.STAFF or user.role == ROLES.STAFF.value:
        from modules.staff import staff_service

        staff_service.activate_by_user_id(db, user.id)
    elif user.role == ROLES.WAREHOUSE_STAFF or user.role == ROLES.WAREHOUSE_STAFF.value:
        from modules.warehouse_staff import warehouse_staff_service

        warehouse_staff_service.activate_by_user_id(db, user.id)

    return user


def get_by_id(db: Session, user_id: UUID) -> User | None:
    user = user_repository.find_by_id(db, user_id)
    if not user:
        raise ApiError(404, COMMON_MESSAGES["NOT_FOUND"])

    return user


def get_by_email(db: Session, email: str) -> User | None:
    if not email or not email.strip():
        return None

    return user_repository.find_by_email(db, email.strip().lower())


def get_by_phone(db: Session, phone: str) -> User | None:
    if not phone or not phone.strip():
        return None

    return user_repository.find_by_phone(db, phone.strip())


def update_me(
    db: Session,
    user_id: UUID,
    phone: str | None,
    full_name: str | None,
) -> User | None:
    update_data = {}

    if phone:
        clean_phone = phone.strip()
        existing_phone_user = user_repository.find_by_phone(db, clean_phone)

        if existing_phone_user and str(existing_phone_user.id) != str(user_id):
            raise ApiError(409, USER_MESSAGES["PHONE_EXISTS"])

        update_data["phone"] = clean_phone

    if full_name:
        clean_full_name = full_name.strip()
        update_data["full_name"] = clean_full_name

    user = user_repository.update_by_id(db, user_id, update_data)
    if not user:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return user


def update_by_admin(
    db: Session,
    user_id: UUID,
    full_name: str | None = None,
    phone: str | None = None,
    email: str | None = None,
) -> User:
    user = get_by_id(db, user_id)

    update_data = {}

    if full_name is not None:
        clean_name = full_name.strip()
        if clean_name:
            update_data["full_name"] = clean_name

    if phone is not None:
        clean_phone = phone.strip()
        if clean_phone:
            existing_phone = user_repository.find_by_phone(db, clean_phone)
            if existing_phone and existing_phone.id != user.id:
                raise ApiError(409, USER_MESSAGES["PHONE_EXISTS"])
            update_data["phone"] = clean_phone

    if email is not None:
        clean_email = email.strip().lower()
        if clean_email:
            existing_email = user_repository.find_by_email(db, clean_email)
            if existing_email and existing_email.id != user.id:
                raise ApiError(409, USER_MESSAGES["EMAIL_EXISTS"])
            update_data["email"] = clean_email

    if not update_data:
        return user

    updated_user = user_repository.update_by_id(db, user_id, update_data)
    if not updated_user:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return updated_user


def change_role(
    db: Session,
    user_id: UUID,
    new_role: str,
    current_admin_id: UUID | None = None,
) -> User:
    valid_roles = [r.value for r in ROLES]
    if new_role not in valid_roles:
        raise ApiError(400, ADMIN_MESSAGES["INVALID_ROLE"])

    if (
        current_admin_id
        and str(user_id) == str(current_admin_id)
        and new_role != ROLES.ADMIN.value
    ):
        raise ApiError(400, ADMIN_MESSAGES["CANNOT_CHANGE_OWN_ROLE"])

    user = get_by_id(db, user_id)

    if user.role != new_role:
        updated_user = user_repository.update_by_id(db, user_id, {"role": new_role})
        if not updated_user:
            raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

        if new_role == ROLES.STAFF or new_role == ROLES.STAFF.value:
            from modules.staff import staff_service

            staff_service.get_or_create_by_user_id(db, user.id)
        elif (
            new_role == ROLES.WAREHOUSE_STAFF or new_role == ROLES.WAREHOUSE_STAFF.value
        ):
            from modules.warehouse_staff import warehouse_staff_service

            warehouse_staff_service.get_or_create_by_user_id(db, user.id)
        elif new_role == ROLES.CUSTOMER or new_role == ROLES.CUSTOMER.value:
            from modules.customer import customer_service

            customer_service.get_or_create_by_user_id(db, user.id)

        return updated_user

    return user


def change_status(
    db: Session,
    user_id: UUID,
    new_status: str,
    current_admin_id: UUID | None = None,
) -> User:
    valid_statuses = [s.value for s in USER_STATUSES]
    if new_status not in valid_statuses:
        raise ApiError(400, ADMIN_MESSAGES["INVALID_STATUS"])

    if (
        current_admin_id
        and str(user_id) == str(current_admin_id)
        and new_status == USER_STATUSES.INACTIVE.value
    ):
        raise ApiError(400, ADMIN_MESSAGES["CANNOT_DEACTIVATE_OWN_ACCOUNT"])

    user = get_by_id(db, user_id)

    if user.status != new_status:
        updated_user = user_repository.update_by_id(db, user_id, {"status": new_status})
        if not updated_user:
            raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

        if new_status == USER_STATUSES.ACTIVE.value:
            if user.role == ROLES.CUSTOMER or user.role == ROLES.CUSTOMER.value:
                from modules.customer import customer_service

                customer_service.activate_by_user_id(db, user.id)
            elif user.role == ROLES.STAFF or user.role == ROLES.STAFF.value:
                from modules.staff import staff_service

                staff_service.activate_by_user_id(db, user.id)
            elif (
                user.role == ROLES.WAREHOUSE_STAFF
                or user.role == ROLES.WAREHOUSE_STAFF.value
            ):
                from modules.warehouse_staff import warehouse_staff_service

                warehouse_staff_service.activate_by_user_id(db, user.id)
        elif new_status == USER_STATUSES.INACTIVE.value:
            if user.role == ROLES.CUSTOMER or user.role == ROLES.CUSTOMER.value:
                from modules.customer import customer_service

                customer_service.deactivate_by_user_id(db, user.id)
            elif user.role == ROLES.STAFF or user.role == ROLES.STAFF.value:
                from modules.staff import staff_service

                staff_service.deactivate_by_user_id(db, user.id)
            elif (
                user.role == ROLES.WAREHOUSE_STAFF
                or user.role == ROLES.WAREHOUSE_STAFF.value
            ):
                from modules.warehouse_staff import warehouse_staff_service

                warehouse_staff_service.deactivate_by_user_id(db, user.id)

        return updated_user

    return user


def get_password_by_id(db: Session, user_id: UUID) -> str:
    current_hashed_password = user_repository.find_password_by_id(db, user_id)

    if not current_hashed_password:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return current_hashed_password


def update_password(db: Session, user_id: UUID, new_hashed_password: str) -> User:
    user = user_repository.update_by_id(db, user_id, {"password": new_hashed_password})

    if not user:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return user


def update_last_login(db: Session, user_id: UUID) -> User:
    user = user_repository.update_by_id(db, user_id, {"last_login": datetime.now()})

    if not user:
        raise ApiError(404, USER_MESSAGES["NOT_FOUND"])

    return user


def get_all(
    db: Session,
    filters: dict | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 10,
):
    if filters is None:
        filters = {}

    page_number = max(1, int(page))
    limit_number = max(1, int(limit))

    skip = (page_number - 1) * limit_number

    users = user_repository.find_all(
        db=db,
        filter=filters,
        search=search,
        skip=skip,
        limit=limit_number,
    )

    total_users = user_repository.count_all(
        db=db,
        filter=filters,
        search=search,
    )

    pagination_data = {
        "page": page_number,
        "limit": limit_number,
        "total": total_users,
        "total_pages": math.ceil(total_users / limit_number) if total_users > 0 else 0,
    }

    return {
        "data": users,
        "pagination": pagination_data,
        "pagnition": pagination_data,
    }


def search_users(
    db: Session,
    search: str,
    filters: dict | None = None,
    page: int = 1,
    limit: int = 10,
):
    return get_all(
        db=db,
        filters=filters,
        search=search,
        page=page,
        limit=limit,
    )
