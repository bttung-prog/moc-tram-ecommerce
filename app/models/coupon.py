import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class DiscountType(str, enum.Enum):
    PERCENTAGE = "PERCENTAGE"          # Giảm theo % (ví dụ 10%, có trần tối đa)
    FIXED_AMOUNT = "FIXED_AMOUNT"      # Giảm số tiền cố định (ví dụ 50,000đ)
    FREE_SHIPPING = "FREE_SHIPPING"    # Miễn phí vận chuyển


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # Vd: THIENAN10, FREESHIP
    description = Column(String(255), nullable=True)
    discount_type = Column(SQLEnum(DiscountType), nullable=False)
    discount_value = Column(Float, nullable=False)  # 10 (10%) hoặc 50000 (50k VND)
    max_discount_amount = Column(Float, nullable=True)  # Giới hạn giảm tối đa cho loại %
    min_order_value = Column(Float, default=0.0)  # Đơn hàng tối thiểu để áp dụng
    
    start_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=False)
    
    usage_limit_total = Column(Integer, nullable=True)  # Tổng số lượt dùng tối đa
    used_count = Column(Integer, default=0)             # Số lượt đã dùng
    usage_limit_per_user = Column(Integer, default=1)   # Số lượt dùng tối đa / khách
    
    applicable_category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    usages = relationship("CouponUsage", back_populates="coupon", cascade="all, delete-orphan")


class CouponUsage(Base):
    __tablename__ = "coupon_usages"

    id = Column(Integer, primary_key=True, index=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    customer_phone = Column(String(20), nullable=False, index=True)
    customer_email = Column(String(150), nullable=False, index=True)
    discount_applied = Column(Float, nullable=False)
    used_at = Column(DateTime, default=datetime.utcnow)

    coupon = relationship("Coupon", back_populates="usages")
