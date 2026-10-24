from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from constants.messages import PRODUCT_MESSAGES
from constants.product_statuses import PRODUCT_STATUSES
from utils.api_error import ApiError


class CreateProductSchema(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Product name",
    )

    category_id: UUID = Field(
        ...,
        description="Category ID that this product belongs to",
    )

    price: Decimal = Field(
        ...,
        gt=0,
        description="Product price (greater than 0)",
    )

    description: str | None = Field(
        default=None,
        description="Detailed product description",
    )

    short_description: str | None = Field(
        default=None,
        description="Short product summary or highlight",
    )

    status: PRODUCT_STATUSES = Field(
        default=PRODUCT_STATUSES.ACTIVE,
        description="Product status (draft, active, inactive)",
    )

    @model_validator(mode="after")
    def validate_create_constraints(self):
        if not self.name or not self.name.strip():
            raise ApiError(400, PRODUCT_MESSAGES["NAME_REQUIRED"])
        self.name = self.name.strip()

        if self.price is None or self.price <= Decimal("0"):
            raise ApiError(400, PRODUCT_MESSAGES["INVALID_PRICE"])

        if self.description:
            self.description = self.description.strip() or None

        if self.short_description:
            self.short_description = self.short_description.strip() or None

        return self


class UpdateProductSchema(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="New product name",
    )

    category_id: UUID | None = Field(
        default=None,
        description="New category ID",
    )

    price: Decimal | None = Field(
        default=None,
        gt=0,
        description="New product price (greater than 0)",
    )

    description: str | None = Field(
        default=None,
        description="New detailed product description",
    )

    short_description: str | None = Field(
        default=None,
        description="New short product summary",
    )

    status: PRODUCT_STATUSES | None = Field(
        default=None,
        description="New product status (draft, active, inactive)",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        provided_fields = [
            self.name,
            self.category_id,
            self.price,
            self.description,
            self.short_description,
            self.status,
        ]

        if all(field is None for field in provided_fields):
            raise ApiError(400, PRODUCT_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

        if self.name is not None:
            if not self.name.strip():
                raise ApiError(400, PRODUCT_MESSAGES["NAME_REQUIRED"])
            self.name = self.name.strip()

        if self.price is not None and self.price <= Decimal("0"):
            raise ApiError(400, PRODUCT_MESSAGES["INVALID_PRICE"])

        if self.description is not None:
            self.description = self.description.strip() or None

        if self.short_description is not None:
            self.short_description = self.short_description.strip() or None

        return self


class UpdateProductStatusSchema(BaseModel):
    status: PRODUCT_STATUSES = Field(
        ...,
        description="New product status (draft, active, inactive)",
    )
