from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator

from constants.discount_types import DiscountType
from constants.messages import COUPON_MESSAGES
from utils.api_error import ApiError


class CreateCouponSchema(BaseModel):
    code: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Coupon code (e.g., MOCXIN10)",
    )

    description: str | None = Field(
        default=None,
        max_length=500,
        description="Detailed description of the coupon",
    )

    discount_type: DiscountType = Field(
        ...,
        description="Discount type: 'percentage' or 'fixed_amount'",
    )

    discount_value: Decimal = Field(
        ...,
        gt=0,
        description="Discount value (percentage rate or fixed amount)",
    )

    max_discount_amount: Decimal | None = Field(
        default=None,
        ge=0,
        description="Maximum discount amount (applicable for percentage discount)",
    )

    min_order_amount: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        description="Minimum order amount required to apply coupon",
    )

    usage_limit: int | None = Field(
        default=None,
        gt=0,
        description="Total maximum usage limit of the coupon",
    )

    usage_limit_per_user: int | None = Field(
        default=1,
        gt=0,
        description="Maximum usage limit per user",
    )

    start_date: datetime | None = Field(
        default=None,
        description="Effective start date and time",
    )

    end_date: datetime | None = Field(
        default=None,
        description="Expiration date and time",
    )

    @model_validator(mode="after")
    def validate_coupon_constraints(self):
        if self.discount_type == DiscountType.PERCENTAGE and self.discount_value > 100:
            raise ApiError(400, COUPON_MESSAGES["INVALID_DISCOUNT_VALUE"])

        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ApiError(400, COUPON_MESSAGES["INVALID_DATE_RANGE"])

        return self


class UpdateCouponSchema(BaseModel):
    code: str | None = Field(
        default=None,
        min_length=3,
        max_length=50,
        description="Coupon code",
    )

    description: str | None = Field(
        default=None,
        max_length=500,
        description="Detailed description of the coupon",
    )

    discount_type: DiscountType | None = Field(
        default=None,
        description="Discount type: 'percentage' or 'fixed_amount'",
    )

    discount_value: Decimal | None = Field(
        default=None,
        gt=0,
        description="Discount value",
    )

    max_discount_amount: Decimal | None = Field(
        default=None,
        ge=0,
        description="Maximum discount amount",
    )

    min_order_amount: Decimal | None = Field(
        default=None,
        ge=0,
        description="Minimum order amount",
    )

    usage_limit: int | None = Field(
        default=None,
        gt=0,
        description="Total maximum usage limit",
    )

    usage_limit_per_user: int | None = Field(
        default=None,
        gt=0,
        description="Maximum usage limit per user",
    )

    start_date: datetime | None = Field(
        default=None,
        description="Effective start date and time",
    )

    end_date: datetime | None = Field(
        default=None,
        description="Expiration date and time",
    )

    is_active: bool | None = Field(
        default=None,
        description="Coupon active status (True/False)",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        provided_fields = [
            self.code,
            self.description,
            self.discount_type,
            self.discount_value,
            self.max_discount_amount,
            self.min_order_amount,
            self.usage_limit,
            self.usage_limit_per_user,
            self.start_date,
            self.end_date,
            self.is_active,
        ]
        if all(field is None for field in provided_fields):
            raise ApiError(400, COUPON_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

        if (
            self.discount_type == DiscountType.PERCENTAGE
            and self.discount_value is not None
        ):
            if self.discount_value > 100:
                raise ApiError(400, COUPON_MESSAGES["INVALID_DISCOUNT_VALUE"])

        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ApiError(400, COUPON_MESSAGES["INVALID_DATE_RANGE"])

        return self


class ApplyCouponSchema(BaseModel):
    code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Coupon code to apply",
    )

    order_amount: Decimal = Field(
        ...,
        ge=0,
        description="Total order amount before discount",
    )
