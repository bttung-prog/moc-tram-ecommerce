from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from constants.messages import WAREHOUSE_MESSAGES
from constants.warehouse_statuses import WAREHOUSE_STATUSES
from utils.api_error import ApiError


class CreateWarehouseSchema(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Warehouse name",
    )

    address: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Warehouse address",
    )

    status: WAREHOUSE_STATUSES = Field(
        default=WAREHOUSE_STATUSES.ACTIVE,
        description="Warehouse status (active, inactive, maintenance)",
    )

    @model_validator(mode="after")
    def validate_create_constraints(self):
        if not self.name or not self.name.strip():
            raise ApiError(400, WAREHOUSE_MESSAGES["NAME_REQUIRED"])
        self.name = self.name.strip()

        if not self.address or not self.address.strip():
            raise ApiError(400, WAREHOUSE_MESSAGES["ADDRESS_REQUIRED"])
        self.address = self.address.strip()

        return self


class UpdateWarehouseSchema(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="New warehouse name",
    )

    address: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="New warehouse address",
    )

    status: WAREHOUSE_STATUSES | None = Field(
        default=None,
        description="New warehouse status (active, inactive, maintenance)",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        provided_fields = [
            self.name,
            self.address,
            self.status,
        ]

        if all(field is None for field in provided_fields):
            raise ApiError(400, WAREHOUSE_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

        if self.name is not None:
            if not self.name.strip():
                raise ApiError(400, WAREHOUSE_MESSAGES["NAME_REQUIRED"])
            self.name = self.name.strip()

        if self.address is not None:
            if not self.address.strip():
                raise ApiError(400, WAREHOUSE_MESSAGES["ADDRESS_REQUIRED"])
            self.address = self.address.strip()

        return self


class UpdateWarehouseStatusSchema(BaseModel):
    status: WAREHOUSE_STATUSES = Field(
        ...,
        description="New warehouse status (active, inactive, maintenance)",
    )


class WarehouseResponseSchema(BaseModel):
    id: UUID
    name: str
    address: str
    status: WAREHOUSE_STATUSES
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = {"from_attributes": True}
