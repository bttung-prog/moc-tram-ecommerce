import math
import os
import urllib.parse
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import PAYMENT_MESSAGES
from constants.order_statuses import ORDER_STATUSES
from constants.payments import PAYMENT_METHODS, PAYMENT_STATUSES
from constants.roles import ROLES
from modules.customer import customer_service
from modules.order import order_service
from modules.payment import payment_repository
from modules.payment.payment import Payment
from utils.api_error import ApiError


def get_bank_config() -> dict[str, str]:
    return {
        "bank_id": os.getenv("VIETQR_BANK_ID"),
        "account_no": os.getenv("VIETQR_ACCOUNT_NO"),
        "account_name": os.getenv("VIETQR_ACCOUNT_NAME"),
        "template": os.getenv("VIETQR_TEMPLATE"),
    }


def build_vietqr_url(
    bank_id: str,
    account_no: str,
    template: str,
    amount: int,
    transfer_content: str,
    account_name: str,
) -> str:
    encoded_content = urllib.parse.quote(transfer_content)
    encoded_name = urllib.parse.quote(account_name)
    return (
        f"https://img.vietqr.io/image/{bank_id}-{account_no}-{template}.png"
        f"?amount={amount}&addInfo={encoded_content}&accountName={encoded_name}"
    )


def _check_order_permission(
    db: Session,
    order,
    current_user_id: UUID | None,
    role: str | None,
) -> None:
    if role == ROLES.CUSTOMER:
        if current_user_id is None:
            raise ApiError(403, PAYMENT_MESSAGES["FORBIDDEN"])
        customer = customer_service.get_or_create_by_user_id(db, current_user_id)
        if order.customer_id != customer.id:
            raise ApiError(403, PAYMENT_MESSAGES["FORBIDDEN"])


def create_or_get_payment(
    db: Session,
    order_id: UUID,
    current_user_id: UUID | None = None,
    role: str | None = None,
) -> Payment:
    order = order_service.get_by_id(db, order_id)

    _check_order_permission(db, order, current_user_id, role)

    if order.status == ORDER_STATUSES.CANCELLED:
        raise ApiError(400, PAYMENT_MESSAGES["ORDER_CANCELLED"])
    if order.status == ORDER_STATUSES.DELIVERED:
        raise ApiError(400, PAYMENT_MESSAGES["ORDER_DELIVERED"])

    existing_payment = payment_repository.find_by_order_id(db, order_id)

    bank_config = get_bank_config()
    transfer_content = f"MT{order.order_number}"
    amount_int = int(order.total_amount)
    qr_url = build_vietqr_url(
        bank_id=bank_config["bank_id"],
        account_no=bank_config["account_no"],
        template=bank_config["template"],
        amount=amount_int,
        transfer_content=transfer_content,
        account_name=bank_config["account_name"],
    )

    now = datetime.now(UTC)

    if existing_payment:
        if existing_payment.status == PAYMENT_STATUSES.SUCCESS:
            return existing_payment

        if existing_payment.status in (
            PAYMENT_STATUSES.EXPIRED,
            PAYMENT_STATUSES.CANCELLED,
        ) or (existing_payment.expires_at and existing_payment.expires_at < now):
            update_data = {
                "status": PAYMENT_STATUSES.PENDING,
                "amount": order.total_amount,
                "transfer_content": transfer_content,
                "qr_code_url": qr_url,
                "expires_at": now + timedelta(minutes=15),
            }
            return payment_repository.update(db, existing_payment, update_data)

        return existing_payment

    payment_data = {
        "order_id": order.id,
        "method": PAYMENT_METHODS.VIETQR,
        "status": PAYMENT_STATUSES.PENDING,
        "amount": order.total_amount,
        "transfer_content": transfer_content,
        "qr_code_url": qr_url,
        "expires_at": now + timedelta(minutes=15),
    }

    return payment_repository.create(db, payment_data)


def get_by_order_id(
    db: Session,
    order_id: UUID,
    current_user_id: UUID | None = None,
    role: str | None = None,
) -> Payment:
    order = order_service.get_by_id(db, order_id)

    _check_order_permission(db, order, current_user_id, role)

    payment = payment_repository.find_by_order_id(db, order_id)
    if not payment:
        return create_or_get_payment(
            db=db,
            order_id=order_id,
            current_user_id=current_user_id,
            role=role,
        )

    now = datetime.now(UTC)
    if (
        payment.status == PAYMENT_STATUSES.PENDING
        and payment.expires_at
        and payment.expires_at < now
    ):
        payment = payment_repository.update(
            db,
            payment,
            {"status": PAYMENT_STATUSES.EXPIRED},
        )

    return payment


def get_by_id(db: Session, payment_id: UUID) -> Payment:
    payment = payment_repository.find_by_id(db, payment_id)
    if not payment:
        raise ApiError(404, PAYMENT_MESSAGES["NOT_FOUND"])
    return payment


def confirm_payment(
    db: Session,
    payment_id: UUID,
    transaction_id: str | None = None,
    note: str | None = None,
) -> Payment:
    payment = get_by_id(db, payment_id)

    if payment.status == PAYMENT_STATUSES.SUCCESS:
        return payment

    now = datetime.now(UTC)
    update_data: dict = {
        "status": PAYMENT_STATUSES.SUCCESS,
        "paid_at": now,
    }
    if transaction_id:
        update_data["transaction_id"] = transaction_id
    if note:
        update_data["note"] = note

    updated_payment = payment_repository.update(db, payment, update_data)

    order = order_service.get_by_id(db, payment.order_id)
    if order.status == ORDER_STATUSES.PENDING:
        order_service.update_status(
            db=db,
            order_id=order.id,
            new_status=ORDER_STATUSES.CONFIRMED,
            note="Xác nhận thanh toán VietQR thành công",
        )

    return updated_payment


def simulate_payment(
    db: Session,
    order_id: UUID,
    current_user_id: UUID | None = None,
    role: str | None = None,
) -> Payment:
    payment = get_by_order_id(
        db=db,
        order_id=order_id,
        current_user_id=current_user_id,
        role=role,
    )

    if payment.status == PAYMENT_STATUSES.SUCCESS:
        return payment

    now = datetime.now(UTC)
    simulated_tx = f"VQR-SIM-{int(now.timestamp())}"

    update_data = {
        "status": PAYMENT_STATUSES.SUCCESS,
        "paid_at": now,
        "transaction_id": simulated_tx,
        "note": "Giả lập thanh toán VietQR thành công (Dev mode)",
    }

    updated_payment = payment_repository.update(db, payment, update_data)

    order = order_service.get_by_id(db, payment.order_id)
    if order.status == ORDER_STATUSES.PENDING:
        order_service.update_status(
            db=db,
            order_id=order.id,
            new_status=ORDER_STATUSES.CONFIRMED,
            note="Khách hàng thanh toán qua VietQR (Giả lập Demo)",
        )

    return updated_payment


def get_all(
    db: Session,
    status: PAYMENT_STATUSES | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:
    filter_data = {}
    if status is not None:
        filter_data["status"] = status

    skip = (page - 1) * limit
    payments = payment_repository.find_all(
        db=db,
        filter_data=filter_data,
        skip=skip,
        limit=limit,
    )
    total_items = payment_repository.count_all(db=db, filter_data=filter_data)

    return {
        "data": payments,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_items": total_items,
            "total_pages": math.ceil(total_items / limit) if total_items > 0 else 0,
        },
    }
