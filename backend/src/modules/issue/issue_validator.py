from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from constants.messages import ISSUE_MESSAGES
from utils.api_error import ApiError


class CreateIssueSchema(BaseModel):
    order_id: UUID = Field(
        ...,
        description="Order ID",
    )

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
        description="Quantity to issue (must be > 0)",
    )

    category_id: UUID | None = Field(
        default=None,
        description="Category ID (optional)",
    )

    note: str | None = Field(
        default=None,
        description="Note / remarks",
    )

    @model_validator(mode="after")
    def validate_constraints(self):
        if self.quantity <= 0:
            raise ApiError(400, ISSUE_MESSAGES["INVALID_QUANTITY"])
        if self.note is not None:
            self.note = self.note.strip() or None
        return self
