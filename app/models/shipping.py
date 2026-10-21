import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ShippingCarrier(str, enum.Enum):
    GHN = "GHN"          # Giao Hàng Nhanh
    GHTK = "GHTK"        # Giao Hàng Tiết Kiệm
    STANDARD = "STANDARD"# Đội giao vận nội bộ / Tiêu chuẩn


class ShippingStatus(str, enum.Enum):
    READY_TO_PICK = "READY_TO_PICK"              # Chờ lấy hàng tại kho Trầm Hương
    PICKED = "PICKED"                            # Shipper đã lấy hàng
    IN_TRANSIT = "IN_TRANSIT"                    # Đang trung chuyển giữa các bưu cục
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"        # Đang giao tới tay khách hàng
    DELIVERED = "DELIVERED"                      # Giao hàng thành công
    FAILED = "FAILED"                            # Giao hàng thất bại
    RETURNED_TO_SENDER = "RETURNED_TO_SENDER"    # Chuyển hoàn về kho


class ShippingOrder(Base):
    __tablename__ = "shipping_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    carrier = Column(SQLEnum(ShippingCarrier), default=ShippingCarrier.GHN, nullable=False)
    tracking_number = Column(String(100), unique=True, nullable=False, index=True)  # Mã vận đơn
    
    shipping_fee = Column(Float, nullable=False, default=0.0)
    cod_amount = Column(Float, nullable=False, default=0.0)
    package_weight_grams = Column(Integer, default=500)
    package_dimensions = Column(String(50), default="20x15x10")  # Dài x Rộng x Cao (cm)
    
    status = Column(SQLEnum(ShippingStatus), default=ShippingStatus.READY_TO_PICK, nullable=False, index=True)
    
    sender_name = Column(String(150), default="Kho Trầm Hương & Thiền Định")
    sender_phone = Column(String(20), default="0901234567")
    sender_address = Column(String(255), default="Tĩnh Tâm Các, Vạn Giã, Vạn Ninh, Khánh Hòa")
    
    recipient_name = Column(String(150), nullable=False)
    recipient_phone = Column(String(20), nullable=False)
    recipient_address = Column(String(255), nullable=False)
    
    estimated_delivery_date = Column(DateTime, nullable=True)
    label_url = Column(String(500), nullable=True)  # Link in phiếu giao hàng
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="shipping_orders")
    tracking_history = relationship("ShippingTrackingHistory", back_populates="shipping_order", cascade="all, delete-orphan")


class ShippingTrackingHistory(Base):
    __tablename__ = "shipping_tracking_history"

    id = Column(Integer, primary_key=True, index=True)
    shipping_order_id = Column(Integer, ForeignKey("shipping_orders.id"), nullable=False, index=True)
    status = Column(SQLEnum(ShippingStatus), nullable=False)
    location = Column(String(150), nullable=False)  # Vd: "Bưu cục Nha Trang", "Kho phân loại Củ Chi"
    description = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    shipping_order = relationship("ShippingOrder", back_populates="tracking_history")
