from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from constants.messages import ISSUE_MESSAGES
from utils.api_error import ApiError


class CreateIssueSchema(BaseModel):
    order_id: UUID = Field(
        ...,
        description="Order ID to export products for",
    )

    warehouse_id: UUID = Field(
        ...,
        description="Warehouse ID where products are exported from",
    )

    product_id: UUID | None = Field(
        default=None,
        description="Product ID to export (optional, auto-filled from order if omitted)",
    )

    quantity: int | None = Field(
        default=None,
        gt=0,
        description="Quantity to issue (must be > 0, optional, auto-filled from remaining order quantity if omitted)",
    )

    category_id: UUID | None = Field(
        default=None,
        description="Category ID (optional, auto-filled from product if omitted)",
    )

    note: str | None = Field(
        default=None,
        description="Note / remarks",
    )

    @model_validator(mode="after")
    def validate_constraints(self):
        if self.quantity is not None and self.quantity <= 0:
            raise ApiError(400, ISSUE_MESSAGES["INVALID_QUANTITY"])
        if self.note is not None:
            self.note = self.note.strip() or None
        return self
