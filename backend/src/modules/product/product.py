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
from constants.product_statuses import PRODUCT_STATUSES
from modules.category.category import Category


class Product(Base):
    __tablename__ = "products"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    category_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("categories.id"),
        nullable=False,
        index=True,
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    short_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[PRODUCT_STATUSES] = mapped_column(
        Enum(
            PRODUCT_STATUSES,
            values_callable=lambda PRODUCT_STATUSES: [
                e.value for e in PRODUCT_STATUSES
            ],
        ),
        nullable=False,
        default=PRODUCT_STATUSES.ACTIVE,
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

    category: Mapped[Category] = relationship(
        "Category",
        lazy="select",
    )
