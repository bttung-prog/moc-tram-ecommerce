from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from configs.db_connection import Base
from constants.payments import PAYMENT_METHODS, PAYMENT_STATUSES
from modules.order.order import Order


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )

    order_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("orders.id"),
        nullable=False,
        unique=True,
    )

    method: Mapped[PAYMENT_METHODS] = mapped_column(
        Enum(
            PAYMENT_METHODS,
            values_callable=lambda PAYMENT_METHODS: [e.value for e in PAYMENT_METHODS],
        ),
        nullable=False,
        default=PAYMENT_METHODS.VIETQR,
    )

    status: Mapped[PAYMENT_STATUSES] = mapped_column(
        Enum(
            PAYMENT_STATUSES,
            values_callable=lambda PAYMENT_STATUSES: [
                e.value for e in PAYMENT_STATUSES
            ],
        ),
        nullable=False,
        default=PAYMENT_STATUSES.PENDING,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    transfer_content: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    qr_code_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    transaction_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        default=None,
    )

    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default=None,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    order: Mapped[Order] = relationship(
        "Order",
        foreign_keys=[order_id],
        lazy="joined",
    )
