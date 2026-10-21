import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    AWAITING_PAYMENT = "AWAITING_PAYMENT"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPING = "SHIPPING"
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    RETURN_REQUESTED = "RETURN_REQUESTED"
    RETURN_APPROVED = "RETURN_APPROVED"
    RETURN_REJECTED = "RETURN_REJECTED"
    RETURN_IN_TRANSIT = "RETURN_IN_TRANSIT"
    RETURNED = "RETURNED"
    REFUNDED = "REFUNDED"


class PaymentMethod(str, enum.Enum):
    COD = "COD"
    VIETQR = "VIETQR"
    PAYPAL = "PAYPAL"


class PaymentStatus(str, enum.Enum):
    UNPAID = "UNPAID"
    PAID = "PAID"
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
    REFUNDED = "REFUNDED"
    FAILED = "FAILED"


class ReservationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMMITTED = "COMMITTED"
    RELEASED = "RELEASED"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(50), nullable=False, unique=True, index=True)  # Vd: DH20261021-001
    
    # Customer Info
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(20), nullable=False, index=True)
    customer_email = Column(String(150), nullable=False, index=True)
    
    # Shipping Address
    shipping_address = Column(String(255), nullable=False)
    province = Column(String(100), nullable=False)  # Tỉnh / TP
    district = Column(String(100), nullable=False)  # Quận / Huyện
    ward = Column(String(100), nullable=False)      # Phường / Xã
    
    # Financials
    subtotal_amount = Column(Float, nullable=False, default=0.0)
    discount_amount = Column(Float, nullable=False, default=0.0)
    shipping_fee = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    coupon_code = Column(String(50), nullable=True)

    # Statuses
    order_status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False, index=True)
    payment_method = Column(SQLEnum(PaymentMethod), default=PaymentMethod.COD, nullable=False)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.UNPAID, nullable=False, index=True)
    
    # Notes & Cancellation
    customer_notes = Column(Text, nullable=True)  # Lời nhắn phòng thiền/gói quà trầm
    cancel_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")
    reservations = relationship("StockReservation", back_populates="order", cascade="all, delete-orphan")
    payment_transactions = relationship("PaymentTransaction", back_populates="order", cascade="all, delete-orphan")
    shipping_orders = relationship("ShippingOrder", back_populates="order", cascade="all, delete-orphan")
    return_requests = relationship("ReturnRequest", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    variant_name = Column(String(200), nullable=False)
    sku = Column(String(100), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    subtotal = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    reason = Column(String(255), nullable=True)
    changed_by = Column(String(100), default="SYSTEM")
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="status_history")


class StockReservation(Base):
    __tablename__ = "stock_reservations"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    status = Column(SQLEnum(ReservationStatus), default=ReservationStatus.ACTIVE, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="reservations")
    variant = relationship("ProductVariant", back_populates="reservations")
