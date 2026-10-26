from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from configs.db_connection import Base


class RegisterOtp(Base):
    __tablename__ = "register_otps"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)

    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    otp: Mapped[str] = mapped_column(String(8), nullable=False)

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
