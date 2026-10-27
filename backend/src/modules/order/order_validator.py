import re
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from constants.messages import ORDER_MESSAGES
from constants.order_statuses import ORDER_STATUSES
from utils.api_error import ApiError

PHONE_REGEX = re.compile(r"^(?:\+84|0)[1-9][0-9]{8}$")


class CreateOrderSchema(BaseModel):
    product_id: UUID = Field(
        ...,
        description="Product ID to order",
    )

    quantity: int = Field(
        default=1,
        gt=0,
        description="Quantity of product (must be greater than 0)",
    )

    unit_price: Decimal | None = Field(
        default=None,
        ge=0,
        description="Price per unit (optional, automatically retrieved from product if omitted)",
    )

    customer_id: UUID | None = Field(
        default=None,
        description="Customer ID placing the order (defaults to current authenticated user if omitted)",
    )

    order_number: str | None = Field(
        default=None,
        max_length=50,
        description="Order display code (optional, auto-generated if omitted)",
    )

    subtotal: Decimal | None = Field(
        default=None,
        ge=0,
        description="Subtotal before discounts and shipping fee (auto-calculated from product if omitted)",
    )

    discount_amount: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        description="Total discount amount",
    )

    shipping_fee: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        description="Shipping fee",
    )

    total_amount: Decimal | None = Field(
        default=None,
        ge=0,
        description="Total amount to pay (optional, auto-calculated if omitted)",
    )

    recipient_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Recipient full name",
    )

    recipient_phone: str = Field(
        ...,
        min_length=8,
        max_length=20,
        description="Recipient phone number",
    )

    shipping_address: str = Field(
        ...,
        min_length=1,
        description="Shipping delivery address",
    )

    note: str | None = Field(
        default=None,
        description="Customer order note or instructions",
    )

    coupon_code: str | None = Field(
        default=None,
        max_length=50,
        description="Coupon code applied to order (optional)",
    )

    @field_validator("recipient_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean_phone = v.strip()
        if not clean_phone:
            raise ApiError(400, ORDER_MESSAGES["RECIPIENT_PHONE_REQUIRED"])
        if not PHONE_REGEX.match(clean_phone):
            raise ApiError(400, ORDER_MESSAGES["INVALID_PHONE_NUMBER"])
        return clean_phone

    @model_validator(mode="after")
    def validate_constraints(self):
        self.recipient_name = self.recipient_name.strip()
        if not self.recipient_name:
            raise ApiError(400, ORDER_MESSAGES["RECIPIENT_NAME_REQUIRED"])

        self.shipping_address = self.shipping_address.strip()
        if not self.shipping_address:
            raise ApiError(400, ORDER_MESSAGES["SHIPPING_ADDRESS_REQUIRED"])

        if self.subtotal is not None:
            if self.subtotal < 0:
                raise ApiError(400, ORDER_MESSAGES["INVALID_SUBTOTAL"])
            if self.discount_amount < 0 or self.discount_amount > self.subtotal:
                raise ApiError(400, ORDER_MESSAGES["INVALID_DISCOUNT_AMOUNT"])
        elif self.discount_amount < 0:
            raise ApiError(400, ORDER_MESSAGES["INVALID_DISCOUNT_AMOUNT"])

        if self.shipping_fee < 0:
            raise ApiError(400, ORDER_MESSAGES["INVALID_SHIPPING_FEE"])

        if self.note is not None:
            self.note = self.note.strip() or None

        if self.order_number is not None:
            self.order_number = self.order_number.strip() or None

        if self.coupon_code is not None:
            self.coupon_code = self.coupon_code.strip().upper() or None

        return self


class UpdateOrderStatusSchema(BaseModel):
    status: ORDER_STATUSES = Field(
        ...,
        description="New order status",
    )

    note: str | None = Field(
        default=None,
        description="Status change note or reason",
    )

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        if isinstance(v, str):
            clean = v.strip().lower()
            try:
                return ORDER_STATUSES(clean)
            except ValueError:
                raise ApiError(400, ORDER_MESSAGES["INVALID_STATUS"]) from None
        return v

    @model_validator(mode="after")
    def validate_note(self):
        if self.note is not None:
            self.note = self.note.strip() or None
        return self


class UpdateOrderSchema(BaseModel):
    recipient_name: str | None = Field(
        default=None,
        max_length=100,
        description="Updated recipient full name",
    )

    recipient_phone: str | None = Field(
        default=None,
        max_length=20,
        description="Updated recipient phone number",
    )

    shipping_address: str | None = Field(
        default=None,
        description="Updated shipping delivery address",
    )

    note: str | None = Field(
        default=None,
        description="Updated order note",
    )

    @field_validator("recipient_phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ApiError(400, ORDER_MESSAGES["RECIPIENT_PHONE_REQUIRED"])
            if not PHONE_REGEX.match(clean):
                raise ApiError(400, ORDER_MESSAGES["INVALID_PHONE_NUMBER"])
            return clean
        return v

    @model_validator(mode="after")
    def validate_fields(self):
        fields = [
            self.recipient_name,
            self.recipient_phone,
            self.shipping_address,
            self.note,
        ]
        if all(f is None for f in fields):
            raise ApiError(400, ORDER_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

        if self.recipient_name is not None:
            self.recipient_name = self.recipient_name.strip()
            if not self.recipient_name:
                raise ApiError(400, ORDER_MESSAGES["RECIPIENT_NAME_REQUIRED"])

        if self.shipping_address is not None:
            self.shipping_address = self.shipping_address.strip()
            if not self.shipping_address:
                raise ApiError(400, ORDER_MESSAGES["SHIPPING_ADDRESS_REQUIRED"])

        if self.note is not None:
            self.note = self.note.strip() or None

        return self
