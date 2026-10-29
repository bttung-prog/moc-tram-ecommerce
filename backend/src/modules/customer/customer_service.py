import math
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from constants.genders import GENDERS
from constants.messages import CUSTOMER_MESSAGES
from constants.roles import ROLES
from modules.customer import customer_repository
from modules.customer.customer import Customer
from modules.user import user_service
from utils.api_error import ApiError


def create(
    db: Session,
    user_id: UUID,
    gender: GENDERS | None = None,
    loyalty_points: int = 0,
    total_spent: Decimal = Decimal("0.00"),
    total_orders: int = 0,
    is_active: bool = True,
) -> Customer:
    user = user_service.get_by_id(db, user_id)

    if user.role != ROLES.CUSTOMER:
        raise ApiError(400, CUSTOMER_MESSAGES["USER_NOT_CUSTOMER"])

    existing_customer = customer_repository.find_by_user_id(db, user_id)
    if existing_customer:
        raise ApiError(409, CUSTOMER_MESSAGES["ALREADY_EXISTS"])

    if loyalty_points < 0:
        raise ApiError(400, CUSTOMER_MESSAGES["INVALID_LOYALTY_POINTS"])
    if total_spent < 0:
        raise ApiError(400, CUSTOMER_MESSAGES["INVALID_TOTAL_SPENT"])
    if total_orders < 0:
        raise ApiError(400, CUSTOMER_MESSAGES["INVALID_TOTAL_ORDERS"])

    new_customer = customer_repository.create(
        db=db,
        customer_data={
            "user_id": user_id,
            "gender": gender,
            "loyalty_points": loyalty_points,
            "total_spent": total_spent,
            "total_orders": total_orders,
            "is_active": is_active,
        },
    )

    return new_customer


def get_or_create_by_user_id(db: Session, user_id: UUID) -> Customer:
    customer = customer_repository.find_by_user_id(db, user_id)
    if customer:
        return customer

    user_service.get_by_id(db, user_id)

    return customer_repository.create(
        db=db,
        customer_data={
            "user_id": user_id,
            "gender": None,
            "loyalty_points": 0,
            "total_spent": Decimal("0.00"),
            "total_orders": 0,
        },
    )


def activate_by_user_id(db: Session, user_id: UUID) -> Customer:
    customer = customer_repository.find_by_user_id(db, user_id)
    if not customer:
        return get_or_create_by_user_id(db, user_id)

    if not customer.is_active or customer.deleted_at is not None:
        customer.is_active = True
        customer.deleted_at = None
        db.flush()
        db.refresh(customer)

    return customer


def deactivate_by_user_id(db: Session, user_id: UUID) -> Customer | None:
    customer = customer_repository.find_by_user_id(db, user_id)
    if not customer:
        return None

    if customer.is_active or customer.deleted_at is None:
        customer_repository.delete_by_id(db, customer.id)

    return customer


def get_by_id(db: Session, customer_id: UUID) -> Customer:
    customer = customer_repository.find_by_id(db, customer_id)
    if not customer:
        raise ApiError(404, CUSTOMER_MESSAGES["NOT_FOUND"])

    return customer


def get_by_user_id(db: Session, user_id: UUID) -> Customer:
    customer = customer_repository.find_by_user_id(db, user_id)
    if not customer:
        raise ApiError(404, CUSTOMER_MESSAGES["NOT_FOUND"])

    return customer


def get_all(
    db: Session,
    filters: dict | None = None,
    search: str | None = None,
    min_points: int | None = None,
    max_points: int | None = None,
    min_spent: Decimal | None = None,
    max_spent: Decimal | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    if filters is None:
        filters = {}

    page_number = max(1, int(page))
    limit_number = max(1, int(limit))
    skip = (page_number - 1) * limit_number

    customers = customer_repository.find_all(
        db=db,
        filter=filters,
        search=search,
        min_points=min_points,
        max_points=max_points,
        min_spent=min_spent,
        max_spent=max_spent,
        skip=skip,
        limit=limit_number,
    )
    total_customers = customer_repository.count_all(
        db=db,
        filter=filters,
        search=search,
        min_points=min_points,
        max_points=max_points,
        min_spent=min_spent,
        max_spent=max_spent,
    )

    return {
        "data": customers,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_customers,
            "total_pages": (
                math.ceil(total_customers / limit_number) if total_customers > 0 else 0
            ),
        },
    }


def update(
    db: Session,
    customer_id: UUID,
    gender: GENDERS | None = None,
    loyalty_points: int | None = None,
    total_spent: Decimal | None = None,
    total_orders: int | None = None,
) -> Customer:
    customer = get_by_id(db, customer_id)

    update_data = {}
    if gender is not None:
        update_data["gender"] = gender

    if loyalty_points is not None:
        if loyalty_points < 0:
            raise ApiError(400, CUSTOMER_MESSAGES["INVALID_LOYALTY_POINTS"])
        update_data["loyalty_points"] = loyalty_points

    if total_spent is not None:
        if total_spent < 0:
            raise ApiError(400, CUSTOMER_MESSAGES["INVALID_TOTAL_SPENT"])
        update_data["total_spent"] = total_spent

    if total_orders is not None:
        if total_orders < 0:
            raise ApiError(400, CUSTOMER_MESSAGES["INVALID_TOTAL_ORDERS"])
        update_data["total_orders"] = total_orders

    if not update_data:
        return customer

    updated_customer = customer_repository.update_by_id(
        db=db,
        customer_id=customer_id,
        customer_data=update_data,
    )
    if not updated_customer:
        raise ApiError(404, CUSTOMER_MESSAGES["NOT_FOUND"])

    return updated_customer


def update_me(
    db: Session,
    user_id: UUID,
    gender: GENDERS | None = None,
) -> Customer:
    customer = get_or_create_by_user_id(db, user_id)

    if gender is not None:
        updated_customer = customer_repository.update_by_id(
            db=db,
            customer_id=customer.id,
            customer_data={"gender": gender},
        )
        if updated_customer:
            return updated_customer

    return customer


def delete(db: Session, customer_id: UUID) -> bool:
    customer = get_by_id(db, customer_id)
    if not customer.is_active:
        raise ApiError(400, CUSTOMER_MESSAGES["ALREADY_DEACTIVATED"])

    return customer_repository.delete_by_id(db, customer.id)


def restore(db: Session, customer_id: UUID) -> Customer:
    customer = get_by_id(db, customer_id)
    if customer.is_active:
        return customer

    restored_customer = customer_repository.restore_by_id(db, customer_id)
    if not restored_customer:
        raise ApiError(404, CUSTOMER_MESSAGES["NOT_FOUND"])

    return restored_customer


def add_order_spent(
    db: Session,
    customer_id: UUID,
    order_total: Decimal,
    points_earned: int = 0,
) -> Customer:
    customer = get_by_id(db, customer_id)

    new_total_spent = customer.total_spent + order_total
    new_total_orders = customer.total_orders + 1
    new_points = customer.loyalty_points + points_earned

    updated_customer = customer_repository.update_by_id(
        db=db,
        customer_id=customer_id,
        customer_data={
            "total_spent": new_total_spent,
            "total_orders": new_total_orders,
            "loyalty_points": new_points,
        },
    )
    if not updated_customer:
        raise ApiError(404, CUSTOMER_MESSAGES["NOT_FOUND"])

    return updated_customer


def adjust_loyalty_points(
    db: Session,
    customer_id: UUID,
    delta: int,
) -> Customer:
    customer = get_by_id(db, customer_id)

    new_points = customer.loyalty_points + delta
    if new_points < 0:
        raise ApiError(400, "Điểm tích lũy không đủ để thực hiện thao tác này")

    updated_customer = customer_repository.update_by_id(
        db=db,
        customer_id=customer_id,
        customer_data={"loyalty_points": new_points},
    )
    if not updated_customer:
        raise ApiError(404, CUSTOMER_MESSAGES["NOT_FOUND"])

    return updated_customer
