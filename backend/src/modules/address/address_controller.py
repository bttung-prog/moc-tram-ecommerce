from uuid import UUID

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import ADDRESS_MESSAGES
from modules.address import address_service
from modules.address.address_validator import (
    AdminCreateAddressSchema,
    CreateAddressSchema,
    UpdateAddressSchema,
)
from utils.api_response import ApiResponse


# Customer Self-service Handlers
def get_my_addresses(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    addresses = address_service.get_all_for_user(db, user_id)

    return ApiResponse.success(
        data=addresses,
    )


def get_my_default_address(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    address = address_service.get_default_for_user(db, user_id)

    return ApiResponse.success(
        data=address,
    )


def get_my_address_by_id(
    address_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    customer_addresses = address_service.get_all_for_user(db, user_id)
    matching = next((a for a in customer_addresses if a.id == address_id), None)
    if not matching:
        return ApiResponse.not_found(message=ADDRESS_MESSAGES["NOT_FOUND"])

    return ApiResponse.success(
        data=matching,
    )


def create_my_address(
    payload: CreateAddressSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    new_address = address_service.create_for_user(
        db=db,
        user_id=user_id,
        recipient_name=payload.recipient_name,
        phone=payload.phone,
        province=payload.province,
        district=payload.district,
        ward=payload.ward,
        street_address=payload.street_address,
        is_default=payload.is_default,
    )

    return ApiResponse.created(
        data=new_address,
        message=ADDRESS_MESSAGES["CREATED"],
    )


def update_my_address(
    address_id: UUID,
    payload: UpdateAddressSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    updated_address = address_service.update_for_user(
        db=db,
        user_id=user_id,
        address_id=address_id,
        recipient_name=payload.recipient_name,
        phone=payload.phone,
        province=payload.province,
        district=payload.district,
        ward=payload.ward,
        street_address=payload.street_address,
        is_default=payload.is_default,
    )

    return ApiResponse.success(
        data=updated_address,
        message=ADDRESS_MESSAGES["UPDATED"],
    )


def set_my_default_address(
    address_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    updated_address = address_service.set_default_for_user(
        db=db,
        user_id=user_id,
        address_id=address_id,
    )

    return ApiResponse.success(
        data=updated_address,
        message=ADDRESS_MESSAGES["SET_DEFAULT_SUCCESS"],
    )


def delete_my_address(
    address_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    address_service.delete_for_user(
        db=db,
        user_id=user_id,
        address_id=address_id,
    )

    return ApiResponse.success(
        message=ADDRESS_MESSAGES["DELETED"],
    )


# Admin / Staff Handlers
def get_by_customer_id(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    addresses = address_service.get_by_customer_id(db, customer_id)

    return ApiResponse.success(
        data=addresses,
    )


def create_for_customer(
    payload: AdminCreateAddressSchema,
    db: Session = Depends(get_db),
):
    new_address = address_service.create(
        db=db,
        customer_id=payload.customer_id,
        recipient_name=payload.recipient_name,
        phone=payload.phone,
        province=payload.province,
        district=payload.district,
        ward=payload.ward,
        street_address=payload.street_address,
        is_default=payload.is_default,
    )

    return ApiResponse.created(
        data=new_address,
        message=ADDRESS_MESSAGES["CREATED"],
    )


def get_by_id(
    address_id: UUID,
    db: Session = Depends(get_db),
):
    address = address_service.get_by_id(db, address_id)

    return ApiResponse.success(
        data=address,
    )


def update(
    address_id: UUID,
    payload: UpdateAddressSchema,
    db: Session = Depends(get_db),
):
    updated_address = address_service.update(
        db=db,
        address_id=address_id,
        recipient_name=payload.recipient_name,
        phone=payload.phone,
        province=payload.province,
        district=payload.district,
        ward=payload.ward,
        street_address=payload.street_address,
        is_default=payload.is_default,
    )

    return ApiResponse.success(
        data=updated_address,
        message=ADDRESS_MESSAGES["UPDATED"],
    )


def set_default(
    address_id: UUID,
    db: Session = Depends(get_db),
):
    updated_address = address_service.set_default(
        db=db,
        address_id=address_id,
    )

    return ApiResponse.success(
        data=updated_address,
        message=ADDRESS_MESSAGES["SET_DEFAULT_SUCCESS"],
    )


def delete(
    address_id: UUID,
    db: Session = Depends(get_db),
):
    address_service.delete(
        db=db,
        address_id=address_id,
    )

    return ApiResponse.success(
        message=ADDRESS_MESSAGES["DELETED"],
    )
