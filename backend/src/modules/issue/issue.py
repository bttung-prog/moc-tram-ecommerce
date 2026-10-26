from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from configs.db_connection import Base
from constants.issue_statuses import ISSUE_STATUSES
from modules.category.category import Category
from modules.product.product import Product
from modules.warehouse.warehouse import Warehouse


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )

    order_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("orders.id"),
        nullable=False,
        index=True,
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

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    status: Mapped[ISSUE_STATUSES] = mapped_column(
        Enum(
            ISSUE_STATUSES,
            values_callable=lambda ISSUE_STATUSES: [e.value for e in ISSUE_STATUSES],
        ),
        nullable=False,
        default=ISSUE_STATUSES.COMPLETED,
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

    @validates("note")
    def validate_note(self, _key: str, value: str | None) -> str | None:
        if value is not None:
            return value.strip()
        return value
