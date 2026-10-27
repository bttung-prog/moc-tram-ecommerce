from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from constants.genders import GENDERS
from constants.messages import CUSTOMER_MESSAGES
from utils.api_error import ApiError


class CreateCustomerSchema(BaseModel):
    user_id: UUID = Field(
        ...,
        description="User ID associated with this customer profile",
    )

    gender: GENDERS | None = Field(
        default=None,
        description="Gender (male, female, other)",
    )

    loyalty_points: int = Field(
        default=0,
        ge=0,
        description="Loyalty points accumulated",
    )

    total_spent: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        description="Total amount spent by customer",
    )

    total_orders: int = Field(
        default=0,
        ge=0,
        description="Total number of orders placed",
    )

    @model_validator(mode="after")
    def validate_constraints(self):
        if self.loyalty_points < 0:
            raise ApiError(400, CUSTOMER_MESSAGES["INVALID_LOYALTY_POINTS"])
        if self.total_spent < 0:
            raise ApiError(400, CUSTOMER_MESSAGES["INVALID_TOTAL_SPENT"])
        if self.total_orders < 0:
            raise ApiError(400, CUSTOMER_MESSAGES["INVALID_TOTAL_ORDERS"])
        return self


class UpdateCustomerSchema(BaseModel):
    gender: GENDERS | None = Field(
        default=None,
        description="Updated gender",
    )

    loyalty_points: int | None = Field(
        default=None,
        ge=0,
        description="Updated loyalty points",
    )

    total_spent: Decimal | None = Field(
        default=None,
        ge=0,
        description="Updated total spent",
    )

    total_orders: int | None = Field(
        default=None,
        ge=0,
        description="Updated total orders",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        fields = [self.gender, self.loyalty_points, self.total_spent, self.total_orders]
        if all(f is None for f in fields):
            raise ApiError(400, "Vui lòng cung cấp ít nhất một trường để cập nhật")

        if self.loyalty_points is not None and self.loyalty_points < 0:
            raise ApiError(400, CUSTOMER_MESSAGES["INVALID_LOYALTY_POINTS"])
        if self.total_spent is not None and self.total_spent < 0:
            raise ApiError(400, CUSTOMER_MESSAGES["INVALID_TOTAL_SPENT"])
        if self.total_orders is not None and self.total_orders < 0:
            raise ApiError(400, CUSTOMER_MESSAGES["INVALID_TOTAL_ORDERS"])
        return self


class UpdateCustomerMeSchema(BaseModel):
    gender: GENDERS | None = Field(
        default=None,
        description="Updated gender for logged in customer",
    )


class AdjustLoyaltyPointsSchema(BaseModel):
    delta: int = Field(
        ...,
        description="Points delta to adjust (positive to add, negative to subtract)",
    )

    @model_validator(mode="after")
    def validate_delta(self):
        if self.delta == 0:
            raise ApiError(400, "Số điểm điều chỉnh phải khác 0")
        return self
