from uuid import UUID

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import CART_MESSAGES
from modules.cart import cart_service
from modules.cart.cart_validator import (
    AddToCartSchema,
    MergeCartSchema,
    UpdateCartItemSchema,
)
from modules.customer import customer_service
from utils.api_response import ApiResponse


def get_cart(
    request: Request,
    db: Session = Depends(get_db),
):
    caller_id = UUID(request.state.user["user_id"])
    customer = customer_service.get_or_create_by_user_id(db, caller_id)

    cart_data = cart_service.get_cart(db, customer.id)

    return ApiResponse.success(
        data=cart_data,
        message=CART_MESSAGES["GET_SUCCESS"],
    )


def add_to_cart(
    payload: AddToCartSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    caller_id = UUID(request.state.user["user_id"])
    customer = customer_service.get_or_create_by_user_id(db, caller_id)

    cart_data = cart_service.add_to_cart(
        db=db,
        customer_id=customer.id,
        product_id=payload.product_id,
        quantity=payload.quantity,
    )

    return ApiResponse.created(
        data=cart_data,
        message=CART_MESSAGES["ITEM_ADDED"],
    )


def update_item_quantity(
    item_id: UUID,
    payload: UpdateCartItemSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    caller_id = UUID(request.state.user["user_id"])
    customer = customer_service.get_or_create_by_user_id(db, caller_id)

    cart_data = cart_service.update_item_quantity(
        db=db,
        customer_id=customer.id,
        item_id=item_id,
        quantity=payload.quantity,
    )

    return ApiResponse.success(
        data=cart_data,
        message=CART_MESSAGES["ITEM_UPDATED"],
    )


def remove_item(
    item_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    caller_id = UUID(request.state.user["user_id"])
    customer = customer_service.get_or_create_by_user_id(db, caller_id)

    cart_data = cart_service.remove_item(
        db=db,
        customer_id=customer.id,
        item_id=item_id,
    )

    return ApiResponse.success(
        data=cart_data,
        message=CART_MESSAGES["ITEM_REMOVED"],
    )


def clear_cart(
    request: Request,
    db: Session = Depends(get_db),
):
    caller_id = UUID(request.state.user["user_id"])
    customer = customer_service.get_or_create_by_user_id(db, caller_id)

    cart_service.clear_cart(db, customer.id)

    return ApiResponse.success(
        data=None,
        message=CART_MESSAGES["CLEARED"],
    )


def merge_cart(
    payload: MergeCartSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    caller_id = UUID(request.state.user["user_id"])
    customer = customer_service.get_or_create_by_user_id(db, caller_id)

    items_data = [item.model_dump() for item in payload.items]
    cart_data = cart_service.merge_cart(
        db=db,
        customer_id=customer.id,
        items=items_data,
    )

    return ApiResponse.success(
        data=cart_data,
        message=CART_MESSAGES["MERGED"],
    )
