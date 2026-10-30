from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from configs.db_connection import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)

    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, unique=True
    )

    token: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
