from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload, selectinload

from modules.cart.cart import Cart
from modules.cart.cart_item import CartItem


def find_cart_by_customer_id(db: Session, customer_id: UUID) -> Cart | None:
    query = (
        select(Cart)
        .where(Cart.customer_id == customer_id)
        .options(selectinload(Cart.items).joinedload(CartItem.product))
    )
    return db.scalar(query)


def create_cart(db: Session, customer_id: UUID) -> Cart:
    new_cart = Cart(customer_id=customer_id)
    db.add(new_cart)
    db.flush()
    db.refresh(new_cart)
    return new_cart


def find_cart_item_by_id(db: Session, item_id: UUID) -> CartItem | None:
    query = (
        select(CartItem)
        .where(CartItem.id == item_id)
        .options(joinedload(CartItem.product), joinedload(CartItem.cart))
    )
    return db.scalar(query)


def find_cart_item(db: Session, cart_id: UUID, product_id: UUID) -> CartItem | None:
    query = (
        select(CartItem)
        .where(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id,
        )
        .options(joinedload(CartItem.product))
    )
    return db.scalar(query)


def create_cart_item(
    db: Session,
    cart_id: UUID,
    product_id: UUID,
    quantity: int,
) -> CartItem:
    new_item = CartItem(
        cart_id=cart_id,
        product_id=product_id,
        quantity=quantity,
    )
    db.add(new_item)
    db.flush()
    db.refresh(new_item)
    return new_item


def update_cart_item_quantity(
    db: Session,
    item: CartItem,
    quantity: int,
) -> CartItem:
    item.quantity = quantity
    item.updated_at = datetime.now(UTC)
    db.flush()
    db.refresh(item)
    return item


def delete_cart_item(db: Session, item: CartItem) -> None:
    db.delete(item)
    db.flush()


def clear_cart_items(db: Session, cart_id: UUID) -> None:
    query = delete(CartItem).where(CartItem.cart_id == cart_id)
    db.execute(query)
    db.flush()
