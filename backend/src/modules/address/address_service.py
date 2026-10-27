from uuid import UUID

from sqlalchemy.orm import Session

from constants.messages import ADDRESS_MESSAGES
from modules.address import address_repository
from modules.address.address import Address
from modules.customer import customer_service
from utils.api_error import ApiError


def create(
    db: Session,
    customer_id: UUID,
    recipient_name: str,
    phone: str,
    province: str,
    district: str,
    ward: str,
    street_address: str,
    is_default: bool = False,
) -> Address:
    customer_service.get_by_id(db, customer_id)

    total_addresses = address_repository.count_by_customer_id(db, customer_id)

    effective_is_default = is_default
    if total_addresses == 0:
        effective_is_default = True
    elif is_default:
        address_repository.unset_all_default_by_customer_id(db, customer_id)

    new_address = address_repository.create(
        db=db,
        address_data={
            "customer_id": customer_id,
            "recipient_name": recipient_name.strip(),
            "phone": phone.strip(),
            "province": province.strip(),
            "district": district.strip(),
            "ward": ward.strip(),
            "street_address": street_address.strip(),
            "is_default": effective_is_default,
        },
    )

    return new_address


def get_by_id(
    db: Session,
    address_id: UUID,
    customer_id: UUID | None = None,
) -> Address:
    address = address_repository.find_by_id(db, address_id)
    if not address:
        raise ApiError(404, ADDRESS_MESSAGES["NOT_FOUND"])

    if customer_id is not None and address.customer_id != customer_id:
        raise ApiError(404, ADDRESS_MESSAGES["NOT_FOUND"])

    return address


def get_by_customer_id(
    db: Session,
    customer_id: UUID,
) -> list[Address]:
    customer_service.get_by_id(db, customer_id)
    return address_repository.find_by_customer_id(db, customer_id)


def get_default_by_customer_id(
    db: Session,
    customer_id: UUID,
) -> Address:
    customer_service.get_by_id(db, customer_id)
    address = address_repository.find_default_by_customer_id(db, customer_id)
    if not address:
        raise ApiError(404, ADDRESS_MESSAGES["NOT_FOUND"])
    return address


def update(
    db: Session,
    address_id: UUID,
    customer_id: UUID | None = None,
    recipient_name: str | None = None,
    phone: str | None = None,
    province: str | None = None,
    district: str | None = None,
    ward: str | None = None,
    street_address: str | None = None,
    is_default: bool | None = None,
) -> Address:
    address = get_by_id(db, address_id, customer_id)

    update_data = {}

    if recipient_name is not None:
        update_data["recipient_name"] = recipient_name.strip()
    if phone is not None:
        update_data["phone"] = phone.strip()
    if province is not None:
        update_data["province"] = province.strip()
    if district is not None:
        update_data["district"] = district.strip()
    if ward is not None:
        update_data["ward"] = ward.strip()
    if street_address is not None:
        update_data["street_address"] = street_address.strip()

    if is_default is not None:
        if is_default:
            if not address.is_default:
                address_repository.unset_all_default_by_customer_id(
                    db,
                    address.customer_id,
                    exclude_id=address.id,
                )
                update_data["is_default"] = True
        else:
            if address.is_default:
                raise ApiError(400, ADDRESS_MESSAGES["CANNOT_UNSET_DEFAULT"])
            update_data["is_default"] = False

    if not update_data:
        return address

    updated_address = address_repository.update_by_id(db, address_id, update_data)
    if not updated_address:
        raise ApiError(404, ADDRESS_MESSAGES["NOT_FOUND"])

    return updated_address


def set_default(
    db: Session,
    address_id: UUID,
    customer_id: UUID | None = None,
) -> Address:
    address = get_by_id(db, address_id, customer_id)

    if address.is_default:
        return address

    address_repository.unset_all_default_by_customer_id(
        db,
        address.customer_id,
        exclude_id=address.id,
    )

    updated_address = address_repository.update_by_id(
        db=db,
        address_id=address_id,
        address_data={"is_default": True},
    )
    if not updated_address:
        raise ApiError(404, ADDRESS_MESSAGES["NOT_FOUND"])

    return updated_address


def delete(
    db: Session,
    address_id: UUID,
    customer_id: UUID | None = None,
) -> bool:
    address = get_by_id(db, address_id, customer_id)

    if address.is_default:
        raise ApiError(400, ADDRESS_MESSAGES["CANNOT_DELETE_DEFAULT"])

    return address_repository.delete_by_id(db, address_id)


# Helper methods for authenticated customer (self-service via user_id)
def create_for_user(
    db: Session,
    user_id: UUID,
    recipient_name: str,
    phone: str,
    province: str,
    district: str,
    ward: str,
    street_address: str,
    is_default: bool = False,
) -> Address:
    customer = customer_service.get_or_create_by_user_id(db, user_id)
    return create(
        db=db,
        customer_id=customer.id,
        recipient_name=recipient_name,
        phone=phone,
        province=province,
        district=district,
        ward=ward,
        street_address=street_address,
        is_default=is_default,
    )


def get_all_for_user(
    db: Session,
    user_id: UUID,
) -> list[Address]:
    customer = customer_service.get_or_create_by_user_id(db, user_id)
    return address_repository.find_by_customer_id(db, customer.id)


def get_default_for_user(
    db: Session,
    user_id: UUID,
) -> Address:
    customer = customer_service.get_or_create_by_user_id(db, user_id)
    return get_default_by_customer_id(db, customer.id)


def update_for_user(
    db: Session,
    user_id: UUID,
    address_id: UUID,
    recipient_name: str | None = None,
    phone: str | None = None,
    province: str | None = None,
    district: str | None = None,
    ward: str | None = None,
    street_address: str | None = None,
    is_default: bool | None = None,
) -> Address:
    customer = customer_service.get_or_create_by_user_id(db, user_id)
    return update(
        db=db,
        address_id=address_id,
        customer_id=customer.id,
        recipient_name=recipient_name,
        phone=phone,
        province=province,
        district=district,
        ward=ward,
        street_address=street_address,
        is_default=is_default,
    )


def set_default_for_user(
    db: Session,
    user_id: UUID,
    address_id: UUID,
) -> Address:
    customer = customer_service.get_or_create_by_user_id(db, user_id)
    return set_default(db=db, address_id=address_id, customer_id=customer.id)


def delete_for_user(
    db: Session,
    user_id: UUID,
    address_id: UUID,
) -> bool:
    customer = customer_service.get_or_create_by_user_id(db, user_id)
    return delete(db=db, address_id=address_id, customer_id=customer.id)
