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
        return self


class UpdateInventorySchema(BaseModel):
    location: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Updated storage location",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        if not self.location or not self.location.strip():
            raise ApiError(400, INVENTORY_MESSAGES["INVALID_LOCATION"])
        self.location = self.location.strip()
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
