from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Integer,
    Numeric,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from configs.db_connection import Base
from constants.discount_types import DiscountType


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )

    code: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    discount_type: Mapped[DiscountType] = mapped_column(
        Enum(
            DiscountType,
            values_callable=lambda DiscountType: [e.value for e in DiscountType],
        ),
        nullable=False,
    )

    discount_value: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    max_discount_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )

    min_order_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0"), nullable=False
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)

    used_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    usage_limit_per_user: Mapped[int] = mapped_column(Integer, default=1, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
