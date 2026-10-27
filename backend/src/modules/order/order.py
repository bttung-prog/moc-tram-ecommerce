from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from configs.db_connection import Base
from constants.order_statuses import ORDER_STATUSES
from modules.customer.customer import Customer
from modules.product.product import Product


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )

    customer_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    product_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("products.id"),
        nullable=False,
        index=True,
    )

    order_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    status: Mapped[ORDER_STATUSES] = mapped_column(
        Enum(
            ORDER_STATUSES,
            values_callable=lambda ORDER_STATUSES: [e.value for e in ORDER_STATUSES],
        ),
        nullable=False,
        default=ORDER_STATUSES.PENDING,
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    shipping_fee: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    recipient_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    recipient_phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    shipping_address: Mapped[str] = mapped_column(
        Text,
        nullable=False,
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

    customer: Mapped[Customer] = relationship(
        "Customer",
        foreign_keys=[customer_id],
        lazy="select",
    )

    product: Mapped[Product] = relationship(
        "Product",
        foreign_keys=[product_id],
        lazy="joined",
    )

    @validates("order_number", "recipient_name", "recipient_phone")
    def validate_strings(self, _key: str, value: str) -> str:
        if value is not None:
            return value.strip()
        return value

    @validates("shipping_address")
    def validate_shipping_address(self, _key: str, value: str) -> str:
        if value is not None:
            return value.strip()
        return value

    @validates("note")
    def validate_note(self, _key: str, value: str | None) -> str | None:
        if value is not None:
            return value.strip()
        return value
