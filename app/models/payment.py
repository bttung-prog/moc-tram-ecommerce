import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class TransactionStatus(str, enum.Enum):
    INITIATED = "INITIATED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    transaction_code = Column(String(100), unique=True, nullable=False, index=True)
    gateway = Column(String(50), nullable=False)  # COD, VIETQR, PAYPAL
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="VND")
    status = Column(SQLEnum(TransactionStatus), default=TransactionStatus.INITIATED, nullable=False, index=True)
    
    # Anti-duplication / Idempotency
    idempotency_key = Column(String(128), unique=True, nullable=True, index=True)
    
    # Gateway specific references (e.g. PayPal Order ID, SePAY transaction ID)
    gateway_reference = Column(String(150), nullable=True, index=True)
    qr_code_data = Column(Text, nullable=True)  # VietQR raw string or base64 image
    approval_url = Column(String(500), nullable=True)  # PayPal approval URL
    raw_response = Column(Text, nullable=True)  # JSON dump of gateway responses/webhooks

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="payment_transactions")
