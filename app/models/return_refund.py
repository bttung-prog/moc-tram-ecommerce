import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ReturnReason(str, enum.Enum):
    DAMAGED_IN_TRANSIT = "DAMAGED_IN_TRANSIT"  # Nứt vỡ lư gốm/hư hỏng chuông xoay do vận chuyển
    WRONG_ITEM = "WRONG_ITEM"                  # Giao nhầm loại nhang hoặc size vòng tay
    DEFECTIVE_AROMA = "DEFECTIVE_AROMA"        # Mùi hương trầm không đúng phẩm chất mô tả
    NOT_AS_DESCRIBED = "NOT_AS_DESCRIBED"      # Sản phẩm không đúng hình ảnh
    CHANGED_MIND = "CHANGED_MIND"              # Khách hàng đổi ý (theo chính sách hỗ trợ)


class ReturnStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"        # Khách vừa gửi yêu cầu đổi trả
    APPROVED = "APPROVED"          # Shop duyệt yêu cầu, chờ khách gửi hàng
    REJECTED = "REJECTED"          # Shop từ chối (không thỏa chính sách)
    IN_TRANSIT = "IN_TRANSIT"      # Khách đang gửi hàng hoàn về kho
    RECEIVED = "RECEIVED"          # Kho đã nhận hàng và kiểm tra
    COMPLETED = "COMPLETED"        # Hoàn tất đổi trả và hoàn tiền


class RefundMethod(str, enum.Enum):
    PAYPAL_API = "PAYPAL_API"          # Hoàn tiền tự động qua API PayPal
    BANK_TRANSFER = "BANK_TRANSFER"    # Chuyển khoản ngân hàng trả lại (cho đơn COD/VietQR)
    STORE_CREDIT = "STORE_CREDIT"      # Voucher bồi hoàn mua hàng lần sau


class RefundStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    request_code = Column(String(50), unique=True, nullable=False, index=True)  # Vd: RET-20261021-001
    
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_email = Column(String(150), nullable=False)
    
    reason = Column(SQLEnum(ReturnReason), nullable=False)
    customer_note = Column(Text, nullable=True)
    proof_images = Column(Text, nullable=True)  # JSON list of image/video URLs
    
    status = Column(SQLEnum(ReturnStatus), default=ReturnStatus.REQUESTED, nullable=False, index=True)
    admin_note = Column(Text, nullable=True)
    return_shipping_code = Column(String(100), nullable=True)  # Mã vận đơn hàng hoàn
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="return_requests")
    items = relationship("ReturnItem", back_populates="return_request", cascade="all, delete-orphan")
    refund_record = relationship("RefundRecord", back_populates="return_request", uselist=False, cascade="all, delete-orphan")


class ReturnItem(Base):
    __tablename__ = "return_items"

    id = Column(Integer, primary_key=True, index=True)
    return_request_id = Column(Integer, ForeignKey("return_requests.id"), nullable=False, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id"), nullable=False)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    restock_status = Column(String(50), default="PENDING")  # PENDING, RESTOCKED, DISCARDED

    return_request = relationship("ReturnRequest", back_populates="items")


class RefundRecord(Base):
    __tablename__ = "refund_records"

    id = Column(Integer, primary_key=True, index=True)
    return_request_id = Column(Integer, ForeignKey("return_requests.id"), nullable=False, unique=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    
    refund_amount = Column(Float, nullable=False)
    refund_method = Column(SQLEnum(RefundMethod), nullable=False)
    gateway_refund_id = Column(String(150), nullable=True, index=True)
    bank_account_info = Column(String(255), nullable=True)  # STK + Tên NH + Chủ TK khi hoàn COD/VietQR
    
    status = Column(SQLEnum(RefundStatus), default=RefundStatus.PENDING, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    return_request = relationship("ReturnRequest", back_populates="refund_record")
