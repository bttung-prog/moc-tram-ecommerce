from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from constants.messages import INVENTORY_MESSAGES
from utils.api_error import ApiError


class CreateInventorySchema(BaseModel):
    warehouse_id: UUID = Field(
        ...,
        description="Warehouse ID",
    )

    product_id: UUID = Field(
        ...,
        description="Product ID",
    )

    quantity: int = Field(
        default=0,
        ge=0,
        description="Initial stock quantity",
    )

    location: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Storage location in warehouse",
    )

    @model_validator(mode="after")
    def validate_create_constraints(self):
        if not self.location or not self.location.strip():
            raise ApiError(400, INVENTORY_MESSAGES["INVALID_LOCATION"])
        self.location = self.location.strip()

        if self.quantity < 0:
            raise ApiError(400, INVENTORY_MESSAGES["INVALID_QUANTITY"])

        return self


class UpdateInventorySchema(BaseModel):
    quantity: int | None = Field(
        default=None,
        ge=0,
        description="Updated quantity",
    )

    location: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Updated location",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        if self.quantity is None and self.location is None:
            raise ApiError(400, INVENTORY_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

        if self.quantity is not None and self.quantity < 0:
            raise ApiError(400, INVENTORY_MESSAGES["INVALID_QUANTITY"])

        if self.location is not None:
            if not self.location.strip():
                raise ApiError(400, INVENTORY_MESSAGES["INVALID_LOCATION"])
            self.location = self.location.strip()

        return self


class AdjustStockSchema(BaseModel):
    delta: int = Field(
        ...,
        description="Quantity delta to adjust (positive to add, negative to subtract)",
    )

    @model_validator(mode="after")
    def validate_delta(self):
        if self.delta == 0:
            raise ApiError(400, "Độ lệch điều chỉnh tồn kho (delta) phải khác 0")
        return self


class InventoryResponseSchema(BaseModel):
    id: UUID
    warehouse_id: UUID
    product_id: UUID
    quantity: int
    location: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
