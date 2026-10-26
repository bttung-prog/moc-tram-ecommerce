from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from configs.db_connection import Base
from modules.warehouse.warehouse import Warehouse


class Inventory(Base):
    __tablename__ = "inventories"

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
        unique=True,
        index=True,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
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

    @validates("location")
    def validate_location(self, _key: str, value: str) -> str:
        if value is not None:
            return value.strip()
        return value
