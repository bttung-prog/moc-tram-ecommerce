from uuid import UUID

from pydantic import BaseModel, Field

from constants.payments import PAYMENT_STATUSES


class CreatePaymentSchema(BaseModel):
    order_id: UUID = Field(
        ...,
        description="Order ID to pay for",
    )


class UpdatePaymentStatusSchema(BaseModel):
    status: PAYMENT_STATUSES = Field(
        default=PAYMENT_STATUSES.SUCCESS,
        description="Updated payment status",
    )

    transaction_id: str | None = Field(
        default=None,
        max_length=100,
        description="Bank transaction ID or reference code",
    )

    note: str | None = Field(
        default=None,
        max_length=500,
        description="Payment note",
    )
