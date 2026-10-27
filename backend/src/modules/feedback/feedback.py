from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from configs.db_connection import Base
from modules.customer.customer import Customer
from modules.order.order import Order


class Feedback(Base):
    __tablename__ = "feedbacks"

    __table_args__ = (
        UniqueConstraint("order_id", name="uq_feedback_order"),
        CheckConstraint(
            "rating >= 1 AND rating <= 5", name="chk_feedback_rating_range"
        ),
    )

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
        index=True,
    )

    customer_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    rating: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    comment: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    reply: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default=None,
    )

    replied_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
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

    customer: Mapped[Customer] = relationship(
        "Customer",
        foreign_keys=[customer_id],
        lazy="select",
    )

    @validates("comment")
    def validate_comment(self, _key: str, value: str) -> str:
        if value is not None:
            return value.strip()
        return value

    @validates("reply")
    def validate_reply(self, _key: str, value: str | None) -> str | None:
        if value is not None:
            return value.strip() or None
        return value
