import math
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from constants.discount_types import DiscountType
from constants.messages import COUPON_MESSAGES
from modules.coupon import coupon_repository
from modules.coupon.coupon import Coupon
from modules.coupon.coupon_usage import CouponUsage
from utils.api_error import ApiError


def create(
    db: Session,
    code: str,
    description: str | None,
    discount_type: str,
    discount_value: Decimal,
    max_discount_amount: Decimal | None,
    min_order_amount: Decimal,
    usage_limit: int | None,
    usage_limit_per_user: int | None,
    start_date: datetime | None,
    end_date: datetime | None,
) -> Coupon:
    if not code or not discount_type or discount_value is None:
        raise ApiError(400, COUPON_MESSAGES["MISSING_REQUIRED_FIELDS"])

    clean_code = code.strip().upper()
    existing_coupon = coupon_repository.find_by_code(db, clean_code)
    if existing_coupon:
        raise ApiError(409, COUPON_MESSAGES["CODE_EXISTS"])

    if (
        discount_type not in [e.value for e in DiscountType]
        and discount_type not in DiscountType
    ):
        raise ApiError(400, COUPON_MESSAGES["INVALID_DISCOUNT_TYPE"])

    if discount_type == DiscountType.PERCENTAGE:
        if discount_value <= 0 or discount_value > 100:
            raise ApiError(400, COUPON_MESSAGES["INVALID_DISCOUNT_VALUE"])
    elif discount_type == DiscountType.FIXED_AMOUNT:
        if discount_value <= 0:
            raise ApiError(400, COUPON_MESSAGES["INVALID_DISCOUNT_VALUE"])

    if max_discount_amount is not None and max_discount_amount < 0:
        raise ApiError(400, COUPON_MESSAGES["INVALID_MAX_DISCOUNT_AMOUNT"])

    if min_order_amount is not None and min_order_amount < 0:
        raise ApiError(400, COUPON_MESSAGES["INVALID_MIN_ORDER_AMOUNT"])

    effective_start_date = start_date if start_date is not None else datetime.now()

    new_coupon = coupon_repository.create(
        db=db,
        coupon_data={
            "code": clean_code,
            "description": description.strip() if description else None,
            "discount_type": discount_type,
            "discount_value": discount_value,
            "max_discount_amount": max_discount_amount,
            "min_order_amount": min_order_amount if min_order_amount is not None else 0,
            "usage_limit": usage_limit,
            "usage_limit_per_user": usage_limit_per_user,
            "start_date": effective_start_date,
            "end_date": end_date,
        },
    )

    return new_coupon


def get_by_id(db: Session, coupon_id: UUID) -> Coupon:
    coupon = coupon_repository.find_by_id(db, coupon_id)
    if not coupon:
        raise ApiError(404, COUPON_MESSAGES["NOT_FOUND"])

    return coupon


def get_by_code(db: Session, code: str) -> Coupon:
    if not code or not code.strip():
        raise ApiError(404, COUPON_MESSAGES["NOT_FOUND"])

    clean_code = code.strip().upper()
    coupon = coupon_repository.find_by_code(db, clean_code)
    if not coupon:
        raise ApiError(404, COUPON_MESSAGES["NOT_FOUND"])

    return coupon


def get_all(
    db: Session,
    filters: dict | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    if filters is None:
        filters = {}

    page_number = max(1, int(page))
    limit_number = max(1, int(limit))
    skip = (page_number - 1) * limit_number

    coupons = coupon_repository.find_all(
        db, filter=filters, skip=skip, limit=limit_number
    )
    total_coupons = coupon_repository.count_all(db, filter=filters)

    return {
        "data": coupons,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_coupons,
            "total_pages": math.ceil(total_coupons / limit_number)
            if total_coupons > 0
            else 0,
        },
    }


def update(
    db: Session,
    coupon_id: UUID,
    code: str | None = None,
    description: str | None = None,
    discount_type: str | None = None,
    discount_value: Decimal | None = None,
    max_discount_amount: Decimal | None = None,
    min_order_amount: Decimal | None = None,
    usage_limit: int | None = None,
    usage_limit_per_user: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    is_active: bool | None = None,
) -> Coupon:
    coupon = coupon_repository.find_by_id(db, coupon_id)
    if not coupon:
        raise ApiError(404, COUPON_MESSAGES["NOT_FOUND"])

    update_data = {}

    if code is not None:
        clean_code = code.strip().upper()
        if not clean_code:
            raise ApiError(400, COUPON_MESSAGES["MISSING_REQUIRED_FIELDS"])

        existing_code = coupon_repository.find_by_code(db, clean_code)
        if existing_code and existing_code.id != coupon_id:
            raise ApiError(409, COUPON_MESSAGES["CODE_EXISTS"])

        update_data["code"] = clean_code

    if description is not None:
        update_data["description"] = description.strip() if description else None

    final_discount_type = (
        discount_type if discount_type is not None else coupon.discount_type
    )
    final_discount_value = (
        discount_value if discount_value is not None else coupon.discount_value
    )

    if discount_type is not None:
        if (
            discount_type not in [e.value for e in DiscountType]
            and discount_type not in DiscountType
        ):
            raise ApiError(400, COUPON_MESSAGES["INVALID_DISCOUNT_TYPE"])
        update_data["discount_type"] = discount_type

    if discount_value is not None or discount_type is not None:
        if final_discount_type == DiscountType.PERCENTAGE:
            if final_discount_value <= 0 or final_discount_value > 100:
                raise ApiError(400, COUPON_MESSAGES["INVALID_DISCOUNT_VALUE"])
        elif final_discount_type == DiscountType.FIXED_AMOUNT:
            if final_discount_value <= 0:
                raise ApiError(400, COUPON_MESSAGES["INVALID_DISCOUNT_VALUE"])
        if discount_value is not None:
            update_data["discount_value"] = discount_value

    if max_discount_amount is not None:
        if max_discount_amount < 0:
            raise ApiError(400, COUPON_MESSAGES["INVALID_MAX_DISCOUNT_AMOUNT"])
        update_data["max_discount_amount"] = max_discount_amount

    if min_order_amount is not None:
        if min_order_amount < 0:
            raise ApiError(400, COUPON_MESSAGES["INVALID_MIN_ORDER_AMOUNT"])
        update_data["min_order_amount"] = min_order_amount

    if usage_limit is not None:
        update_data["usage_limit"] = usage_limit

    if usage_limit_per_user is not None:
        update_data["usage_limit_per_user"] = usage_limit_per_user

    if start_date is not None:
        update_data["start_date"] = start_date

    if end_date is not None:
        update_data["end_date"] = end_date

    if is_active is not None:
        update_data["is_active"] = is_active

    updated_coupon = coupon_repository.update_by_id(db, coupon_id, update_data)
    if not updated_coupon:
        raise ApiError(404, COUPON_MESSAGES["NOT_FOUND"])

    return updated_coupon


def delete_by_id(db: Session, coupon_id: UUID) -> bool:
    coupon = coupon_repository.find_by_id(db, coupon_id)
    if not coupon:
        raise ApiError(404, COUPON_MESSAGES["NOT_FOUND"])

    return coupon_repository.delete_by_id(db, coupon_id)


def delete_by_code(db: Session, code: str) -> bool:
    if not code or not code.strip():
        raise ApiError(404, COUPON_MESSAGES["NOT_FOUND"])

    clean_code = code.strip().upper()
    coupon = coupon_repository.find_by_code(db, clean_code)
    if not coupon:
        raise ApiError(404, COUPON_MESSAGES["NOT_FOUND"])

    return coupon_repository.delete_by_code(db, clean_code)


def validate_and_calculate_discount(
    db: Session,
    code: str,
    user_id: UUID,
    subtotal: Decimal,
) -> tuple[Coupon, Decimal]:
    coupon = get_by_code(db, code)
    now = (
        datetime.now(coupon.start_date.tzinfo)
        if coupon.start_date and coupon.start_date.tzinfo
        else datetime.now()
    )

    if not coupon.is_active:
        raise ApiError(400, COUPON_MESSAGES["INACTIVE"])

    if coupon.start_date and coupon.start_date > now:
        raise ApiError(400, COUPON_MESSAGES["NOT_STARTED"])

    if coupon.end_date and coupon.end_date < now:
        raise ApiError(400, COUPON_MESSAGES["EXPIRED"])

    if coupon.min_order_amount and subtotal < coupon.min_order_amount:
        raise ApiError(
            400,
            f"{COUPON_MESSAGES['MIN_ORDER_AMOUNT_NOT_MET']} (Yêu cầu tối thiểu {coupon.min_order_amount})",
        )

    if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
        raise ApiError(400, COUPON_MESSAGES["USAGE_LIMIT_EXCEEDED"])

    if coupon.usage_limit_per_user is not None:
        user_usages = coupon_repository.count_user_usages(db, coupon.id, user_id)
        if user_usages >= coupon.usage_limit_per_user:
            raise ApiError(400, COUPON_MESSAGES["USER_USAGE_LIMIT_EXCEEDED"])

    if coupon.discount_type == DiscountType.PERCENTAGE:
        discount = subtotal * (coupon.discount_value / Decimal("100"))
        if coupon.max_discount_amount is not None:
            discount = min(discount, coupon.max_discount_amount)
    elif coupon.discount_type == DiscountType.FIXED_AMOUNT:
        discount = min(subtotal, coupon.discount_value)
    else:
        discount = Decimal("0.00")

    return coupon, discount


def apply_coupon(
    db: Session,
    coupon_id: UUID,
    user_id: UUID,
    order_id: UUID,
    discount_amount: Decimal,
) -> CouponUsage:
    usage = coupon_repository.create_usage(
        db,
        usage_data={
            "coupon_id": coupon_id,
            "user_id": user_id,
            "order_id": order_id,
            "discount_amount": discount_amount,
            "used_at": datetime.now(),
        },
    )
    coupon_repository.adjust_used_count(db, coupon_id, delta=1)
    return usage


def revert_coupon_usage(db: Session, order_id: UUID) -> bool:
    usage = coupon_repository.find_usage_by_order_id(db, order_id)
    if not usage:
        return False

    coupon_id = usage.coupon_id
    deleted = coupon_repository.delete_usage_by_order_id(db, order_id)
    if deleted:
        coupon_repository.adjust_used_count(db, coupon_id, delta=-1)
    return deleted
