from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import CART_MESSAGES
from constants.product_statuses import PRODUCT_STATUSES
from modules.cart import cart_repository
from modules.cart.cart import Cart
from modules.inventory import inventory_repository
from modules.product import product_service
from utils.api_error import ApiError

FREE_SHIPPING_THRESHOLD = Decimal("500000.00")
DEFAULT_SHIPPING_FEE = Decimal("30000.00")


def get_or_create_cart(db: Session, customer_id: UUID) -> Cart:
    cart = cart_repository.find_cart_by_customer_id(db, customer_id)
    if not cart:
        cart = cart_repository.create_cart(db, customer_id)
    return cart


def _format_cart_data(db: Session, cart: Cart) -> dict:
    formatted_items = []
    subtotal = Decimal("0.00")
    total_quantity = 0

    for item in cart.items:
        product = item.product
        if not product:
            continue

        inventory = inventory_repository.find_by_product_id(db, item.product_id)
        stock_quantity = inventory.quantity if inventory else 0
        is_active = product.status == PRODUCT_STATUSES.ACTIVE
        is_in_stock = is_active and (stock_quantity >= item.quantity)

        unit_price = Decimal(str(product.price))
        line_total = unit_price * item.quantity

        if is_active:
            subtotal += line_total
            total_quantity += item.quantity

        formatted_items.append(
            {
                "id": str(item.id),
                "product_id": str(product.id),
                "product_name": product.name,
                "price": float(unit_price),
                "quantity": item.quantity,
                "subtotal": float(line_total),
                "status": product.status.value,
                "is_available": is_active,
                "is_in_stock": is_in_stock,
                "stock_quantity": stock_quantity,
                "warning": None
                if is_in_stock
                else (
                    "Sản phẩm tạm ngưng bán"
                    if not is_active
                    else f"Chỉ còn {stock_quantity} sản phẩm trong kho"
                ),
            }
        )

    if total_quantity == 0 or subtotal == Decimal("0.00"):
        shipping_fee = Decimal("0.00")
    elif subtotal >= FREE_SHIPPING_THRESHOLD:
        shipping_fee = Decimal("0.00")
    else:
        shipping_fee = DEFAULT_SHIPPING_FEE

    total_amount = subtotal + shipping_fee

    return {
        "cart_id": str(cart.id),
        "customer_id": str(cart.customer_id),
        "items": formatted_items,
        "total_items": total_quantity,
        "subtotal": float(subtotal),
        "shipping_fee": float(shipping_fee),
        "free_shipping_threshold": float(FREE_SHIPPING_THRESHOLD),
        "total_amount": float(total_amount),
    }


def get_cart(db: Session, customer_id: UUID) -> dict:
    cart = get_or_create_cart(db, customer_id)
    return _format_cart_data(db, cart)


def add_to_cart(
    db: Session,
    customer_id: UUID,
    product_id: UUID,
    quantity: int = 1,
) -> dict:
    if quantity <= 0:
        raise ApiError(400, CART_MESSAGES["INVALID_QUANTITY"])

    product = product_service.get_by_id(db, product_id)
    if product.status != PRODUCT_STATUSES.ACTIVE:
        raise ApiError(400, CART_MESSAGES["PRODUCT_INACTIVE"])

    inventory = inventory_repository.find_by_product_id(db, product_id)
    available_stock = inventory.quantity if inventory else 0

    if available_stock < quantity:
        raise ApiError(
            400,
            f"Số lượng trong kho không đủ (Hiện còn {available_stock} sản phẩm)",
        )

    cart = get_or_create_cart(db, customer_id)
    existing_item = cart_repository.find_cart_item(db, cart.id, product_id)

    if existing_item:
        new_quantity = existing_item.quantity + quantity
        if new_quantity > available_stock:
            raise ApiError(
                400,
                f"Tổng số lượng trong giỏ ({new_quantity}) vượt quá tồn kho hiện có ({available_stock})",
            )
        cart_repository.update_cart_item_quantity(db, existing_item, new_quantity)
    else:
        cart_repository.create_cart_item(db, cart.id, product_id, quantity)

    # Refresh cart
    db.expire(cart)
    refreshed_cart = cart_repository.find_cart_by_customer_id(db, customer_id)
    return _format_cart_data(db, refreshed_cart or cart)


def update_item_quantity(
    db: Session,
    customer_id: UUID,
    item_id: UUID,
    quantity: int,
) -> dict:
    cart = get_or_create_cart(db, customer_id)
    item = cart_repository.find_cart_item_by_id(db, item_id)

    if not item or item.cart_id != cart.id:
        raise ApiError(404, CART_MESSAGES["ITEM_NOT_FOUND"])

    if quantity <= 0:
        cart_repository.delete_cart_item(db, item)
    else:
        inventory = inventory_repository.find_by_product_id(db, item.product_id)
        available_stock = inventory.quantity if inventory else 0

        if quantity > available_stock:
            raise ApiError(
                400,
                f"Số lượng yêu cầu ({quantity}) vượt quá tồn kho hiện có ({available_stock})",
            )
        cart_repository.update_cart_item_quantity(db, item, quantity)

    db.expire(cart)
    refreshed_cart = cart_repository.find_cart_by_customer_id(db, customer_id)
    return _format_cart_data(db, refreshed_cart or cart)


def remove_item(
    db: Session,
    customer_id: UUID,
    item_id: UUID,
) -> dict:
    cart = get_or_create_cart(db, customer_id)
    item = cart_repository.find_cart_item_by_id(db, item_id)

    if not item or item.cart_id != cart.id:
        raise ApiError(404, CART_MESSAGES["ITEM_NOT_FOUND"])

    cart_repository.delete_cart_item(db, item)

    db.expire(cart)
    refreshed_cart = cart_repository.find_cart_by_customer_id(db, customer_id)
    return _format_cart_data(db, refreshed_cart or cart)


def clear_cart(db: Session, customer_id: UUID) -> None:
    cart = get_or_create_cart(db, customer_id)
    cart_repository.clear_cart_items(db, cart.id)


def merge_cart(
    db: Session,
    customer_id: UUID,
    items: list[dict],
) -> dict:
    cart = get_or_create_cart(db, customer_id)

    for item_data in items:
        product_id = item_data.get("product_id")
        quantity = item_data.get("quantity", 1)

        if not product_id or quantity <= 0:
            continue

        try:
            product = product_service.get_by_id(db, product_id)
            if product.status != PRODUCT_STATUSES.ACTIVE:
                continue
        except ApiError:
            continue

        inventory = inventory_repository.find_by_product_id(db, product_id)
        available_stock = inventory.quantity if inventory else 0
        if available_stock <= 0:
            continue

        existing_item = cart_repository.find_cart_item(db, cart.id, product_id)
        if existing_item:
            desired_quantity = existing_item.quantity + quantity
            final_quantity = min(desired_quantity, available_stock)
            cart_repository.update_cart_item_quantity(db, existing_item, final_quantity)
        else:
            final_quantity = min(quantity, available_stock)
            cart_repository.create_cart_item(db, cart.id, product_id, final_quantity)

    db.expire(cart)
    refreshed_cart = cart_repository.find_cart_by_customer_id(db, customer_id)
    return _format_cart_data(db, refreshed_cart or cart)
