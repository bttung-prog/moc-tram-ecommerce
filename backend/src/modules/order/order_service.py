import math
from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import ORDER_MESSAGES
from constants.order_statuses import ORDER_STATUSES
from constants.product_statuses import PRODUCT_STATUSES
from modules.coupon import coupon_service
from modules.customer import customer_service
from modules.inventory import inventory_service
from modules.issue import issue_service
from modules.order import order_repository
from modules.order.order import Order
from modules.product import product_service
from utils.api_error import ApiError
from utils.generate_code import generate_order_code

ALLOWED_STATUS_TRANSITIONS: dict[ORDER_STATUSES, list[ORDER_STATUSES]] = {
    ORDER_STATUSES.PENDING: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED],
    ORDER_STATUSES.CONFIRMED: [ORDER_STATUSES.SHIPPING, ORDER_STATUSES.CANCELLED],
    ORDER_STATUSES.SHIPPING: [
        ORDER_STATUSES.CONFIRMED,
        ORDER_STATUSES.DELIVERED,
        ORDER_STATUSES.CANCELLED,
    ],
    ORDER_STATUSES.DELIVERED: [],
    ORDER_STATUSES.CANCELLED: [],
}


def _generate_unique_order_number(db: Session, max_attempts: int = 10) -> str:
    for _ in range(max_attempts):
        candidate = generate_order_code()
        if not order_repository.exists_by_order_number(db, candidate):
            return candidate

    timestamp_suffix = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
    fallback = f"MT-{timestamp_suffix}"
    if not order_repository.exists_by_order_number(db, fallback):
        return fallback

    raise ApiError(500, "Không thể khởi tạo mã đơn hàng duy nhất, vui lòng thử lại sau")


def create(
    db: Session,
    customer_id: UUID,
    product_id: UUID,
    recipient_name: str,
    recipient_phone: str,
    shipping_address: str,
    quantity: int = 1,
    unit_price: Decimal | None = None,
    subtotal: Decimal | None = None,
    discount_amount: Decimal = Decimal("0.00"),
    shipping_fee: Decimal = Decimal("0.00"),
    total_amount: Decimal | None = None,
    order_number: str | None = None,
    note: str | None = None,
    coupon_code: str | None = None,
) -> Order:
    customer = customer_service.get_by_id(db, customer_id)

    product = product_service.get_by_id(db, product_id)
    if product.status != PRODUCT_STATUSES.ACTIVE:
        raise ApiError(
            400,
            f"Sản phẩm '{product.name}' hiện đang tạm ngưng kinh doanh",
        )

    inventory = inventory_service.get_by_product_id(db, product_id)
    if inventory.quantity < quantity:
        raise ApiError(
            400,
            f"Sản phẩm '{product.name}' trong kho không đủ (chỉ còn {inventory.quantity}, yêu cầu {quantity})",
        )

    actual_unit_price = unit_price if unit_price is not None else product.price
    line_total = actual_unit_price * quantity

    final_subtotal = subtotal if subtotal is not None else line_total

    if final_subtotal < 0:
        raise ApiError(400, ORDER_MESSAGES["INVALID_SUBTOTAL"])
    if shipping_fee < 0:
        raise ApiError(400, ORDER_MESSAGES["INVALID_SHIPPING_FEE"])

    effective_discount = discount_amount
    applied_coupon = None

    if coupon_code:
        applied_coupon, calculated_discount = (
            coupon_service.validate_and_calculate_discount(
                db=db,
                code=coupon_code,
                user_id=customer.user_id,
                subtotal=final_subtotal,
            )
        )
        if effective_discount == Decimal("0.00"):
            effective_discount = calculated_discount

    if effective_discount < 0 or effective_discount > final_subtotal:
        raise ApiError(400, ORDER_MESSAGES["INVALID_DISCOUNT_AMOUNT"])

    calculated_total = max(
        Decimal("0.00"), final_subtotal - effective_discount + shipping_fee
    )
    final_total = total_amount if total_amount is not None else calculated_total

    if final_total < 0:
        raise ApiError(400, ORDER_MESSAGES["INVALID_TOTAL_AMOUNT"])

    if order_number and order_number.strip():
        clean_order_number = order_number.strip()
        if order_repository.exists_by_order_number(db, clean_order_number):
            raise ApiError(409, ORDER_MESSAGES["ORDER_NUMBER_EXISTS"])
        final_order_number = clean_order_number
    else:
        final_order_number = _generate_unique_order_number(db)

    new_order = order_repository.create(
        db=db,
        order_data={
            "customer_id": customer.id,
            "product_id": product.id,
            "quantity": quantity,
            "unit_price": actual_unit_price,
            "order_number": final_order_number,
            "status": ORDER_STATUSES.PENDING,
            "subtotal": final_subtotal,
            "discount_amount": effective_discount,
            "shipping_fee": shipping_fee,
            "total_amount": final_total,
            "recipient_name": recipient_name.strip(),
            "recipient_phone": recipient_phone.strip(),
            "shipping_address": shipping_address.strip(),
            "note": note.strip() if note else None,
        },
    )

    if applied_coupon and effective_discount > 0:
        coupon_service.apply_coupon(
            db=db,
            coupon_id=applied_coupon.id,
            user_id=customer.user_id,
            order_id=new_order.id,
            discount_amount=effective_discount,
        )

    return new_order


def get_by_id(db: Session, order_id: UUID) -> Order:
    order = order_repository.find_by_id(db, order_id)
    if not order:
        raise ApiError(404, ORDER_MESSAGES["NOT_FOUND"])
    return order


def get_by_order_number(db: Session, order_number: str) -> Order:
    clean_number = order_number.strip()
    order = order_repository.find_by_order_number(db, clean_number)
    if not order:
        raise ApiError(404, ORDER_MESSAGES["NOT_FOUND"])
    return order


def get_all(
    db: Session,
    filters: dict | None = None,
    search: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    min_total: Decimal | None = None,
    max_total: Decimal | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    if filters is None:
        filters = {}

    page_number = max(1, int(page))
    limit_number = max(1, int(limit))
    skip = (page_number - 1) * limit_number

    orders = order_repository.find_all(
        db=db,
        filter=filters,
        search=search,
        start_date=start_date,
        end_date=end_date,
        min_total=min_total,
        max_total=max_total,
        skip=skip,
        limit=limit_number,
    )

    total_orders = order_repository.count_all(
        db=db,
        filter=filters,
        search=search,
        start_date=start_date,
        end_date=end_date,
        min_total=min_total,
        max_total=max_total,
    )

    return {
        "data": orders,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_orders,
            "total_pages": (
                math.ceil(total_orders / limit_number) if total_orders > 0 else 0
            ),
        },
    }


def get_my_orders(
    db: Session,
    customer_id: UUID,
    status: str | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    customer = customer_service.get_by_id(db, customer_id)

    actual_customer_id = customer.id
    page_number = max(1, int(page))
    limit_number = max(1, int(limit))
    skip = (page_number - 1) * limit_number

    orders = order_repository.find_by_customer_id(
        db=db,
        customer_id=actual_customer_id,
        status=status,
        skip=skip,
        limit=limit_number,
    )

    total_orders = order_repository.count_by_customer_id(
        db=db,
        customer_id=actual_customer_id,
        status=status,
    )

    return {
        "data": orders,
        "pagination": {
            "page": page_number,
            "limit": limit_number,
            "total": total_orders,
            "total_pages": (
                math.ceil(total_orders / limit_number) if total_orders > 0 else 0
            ),
        },
    }


def update_status(
    db: Session,
    order_id: UUID,
    new_status: ORDER_STATUSES,
    note: str | None = None,
) -> Order:
    order = get_by_id(db, order_id)

    if order.status == new_status:
        return order

    if order.status == ORDER_STATUSES.DELIVERED:
        raise ApiError(400, ORDER_MESSAGES["ALREADY_DELIVERED"])

    if order.status == ORDER_STATUSES.CANCELLED:
        raise ApiError(400, ORDER_MESSAGES["ALREADY_CANCELLED"])

    allowed_next_statuses = ALLOWED_STATUS_TRANSITIONS.get(order.status, [])
    if new_status not in allowed_next_statuses:
        raise ApiError(400, ORDER_MESSAGES["INVALID_STATUS_TRANSITION"])

    update_data: dict = {"status": new_status}
    if note is not None and note.strip():
        existing_note = order.note or ""
        update_data["note"] = (
            f"{existing_note}\n[Cập nhật trạng thái {new_status.value}]: {note.strip()}".strip()
        )

    updated_order = order_repository.update_by_id(db, order_id, update_data)
    if not updated_order:
        raise ApiError(404, ORDER_MESSAGES["NOT_FOUND"])

    if new_status == ORDER_STATUSES.DELIVERED:
        points_earned = int(updated_order.total_amount // Decimal("10000"))
        customer_service.add_order_spent(
            db=db,
            customer_id=updated_order.customer_id,
            order_total=updated_order.total_amount,
            points_earned=points_earned,
        )

    if new_status == ORDER_STATUSES.CANCELLED:
        try:
            coupon_service.revert_coupon_usage(db, updated_order.id)
        except Exception:
            pass

        try:
            related_issues = issue_service.get_by_order_id(db, updated_order.id)
            for issue in related_issues:
                if issue.status != "cancelled":
                    issue_service.cancel(db, issue.id)
        except Exception:
            pass

    return updated_order


def cancel(
    db: Session,
    order_id: UUID,
    note: str | None = None,
) -> Order:
    return update_status(
        db=db,
        order_id=order_id,
        new_status=ORDER_STATUSES.CANCELLED,
        note=note,
    )


def update_shipping_info(
    db: Session,
    order_id: UUID,
    recipient_name: str | None = None,
    recipient_phone: str | None = None,
    shipping_address: str | None = None,
    note: str | None = None,
) -> Order:
    order = get_by_id(db, order_id)

    if order.status not in (ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED):
        raise ApiError(400, ORDER_MESSAGES["CANNOT_UPDATE_SHIPPED_ORDER"])

    update_data = {}
    if recipient_name is not None and recipient_name.strip():
        update_data["recipient_name"] = recipient_name.strip()
    if recipient_phone is not None and recipient_phone.strip():
        update_data["recipient_phone"] = recipient_phone.strip()
    if shipping_address is not None and shipping_address.strip():
        update_data["shipping_address"] = shipping_address.strip()
    if note is not None:
        update_data["note"] = note.strip() or None

    if not update_data:
        return order

    updated_order = order_repository.update_by_id(db, order_id, update_data)
    if not updated_order:
        raise ApiError(404, ORDER_MESSAGES["NOT_FOUND"])

    return updated_order
