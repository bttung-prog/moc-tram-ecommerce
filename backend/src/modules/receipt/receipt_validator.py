from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from constants.messages import RECEIPT_MESSAGES
from utils.api_error import ApiError


class CreateReceiptSchema(BaseModel):
    warehouse_id: UUID = Field(
        ...,
        description="Warehouse ID",
    )

    product_id: UUID = Field(
        ...,
        description="Product ID",
    )

    quantity: int = Field(
        ...,
        gt=0,
        description="Quantity to receive into warehouse",
    )

    unit_price: Decimal | None = Field(
        default=None,
        ge=0,
        description="Unit cost/purchase price",
    )

    supplier: str | None = Field(
        default=None,
        max_length=255,
        description="Supplier name or source",
    )

    category_id: UUID | None = Field(
        default=None,
        description="Category ID (optional)",
    )

    location: str | None = Field(
        default=None,
        max_length=255,
        description="Warehouse location (if initial stock record)",
    )

    note: str | None = Field(
        default=None,
        description="Note / remarks",
    )

    @model_validator(mode="after")
    def validate_constraints(self):
        if self.quantity <= 0:
            raise ApiError(400, RECEIPT_MESSAGES["INVALID_QUANTITY"])
        if self.supplier is not None:
            self.supplier = self.supplier.strip() or None
        if self.location is not None:
            self.location = self.location.strip() or None
        if self.note is not None:
            self.note = self.note.strip() or None
        return self
