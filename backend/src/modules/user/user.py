from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from configs.db_connection import Base
from constants.roles import ROLES
from constants.user_statuses import USER_STATUSES


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    password: Mapped[str] = mapped_column(String(255), nullable=False)

    full_name: Mapped[str] = mapped_column(String(100), nullable=False)

    phone: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)

    role: Mapped[ROLES] = mapped_column(
        Enum(
            ROLES,
            values_callable=lambda ROLES: [e.value for e in ROLES],
        ),
        nullable=False,
        default=ROLES.CUSTOMER,
    )

    status: Mapped[USER_STATUSES] = mapped_column(
        Enum(
            USER_STATUSES,
            values_callable=lambda USER_STATUSES: [e.value for e in USER_STATUSES],
        ),
        nullable=False,
        default=USER_STATUSES.ACTIVE,
    )

    last_login: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )
