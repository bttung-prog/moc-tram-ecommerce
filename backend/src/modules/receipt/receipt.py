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
from constants.receipt_statuses import RECEIPT_STATUSES
from modules.category.category import Category
from modules.product.product import Product
from modules.warehouse.warehouse import Warehouse


class Receipt(Base):
    __tablename__ = "receipts"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )

    warehouse_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("warehouses.id"),
        nullable=False,
        index=True,
    )

    product_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("products.id"),
        nullable=False,
        index=True,
    )

    category_id: Mapped[UUID | None] = mapped_column(
        Uuid,
        ForeignKey("categories.id"),
        nullable=True,
        index=True,
        default=None,
    )

    supplier: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    unit_price: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    status: Mapped[RECEIPT_STATUSES] = mapped_column(
        Enum(
            RECEIPT_STATUSES,
            values_callable=lambda RECEIPT_STATUSES: [
                e.value for e in RECEIPT_STATUSES
            ],
        ),
        nullable=False,
        default=RECEIPT_STATUSES.COMPLETED,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
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

    warehouse: Mapped[Warehouse] = relationship(
        "Warehouse",
        lazy="select",
    )

    product: Mapped[Product] = relationship(
        "Product",
        lazy="select",
    )

    category: Mapped[Category | None] = relationship(
        "Category",
        lazy="select",
    )

    @validates("supplier")
    def validate_supplier(self, _key: str, value: str | None) -> str | None:
        if value is not None:
            return value.strip()
        return value

    @validates("note")
    def validate_note(self, _key: str, value: str | None) -> str | None:
        if value is not None:
            return value.strip()
        return value
