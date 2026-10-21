from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(120), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(250), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    origin = Column(String(100), default="Khánh Hòa, Việt Nam")  # Xứ sở trầm hương
    fragrance_notes = Column(String(255), nullable=True)  # Mùi vị thanh ngọt, ấm nồng, thiền tịnh
    base_price = Column(Float, nullable=False, default=0.0)
    weight_grams = Column(Integer, default=300)  # Cân nặng cho tính phí ship
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    sku = Column(String(100), nullable=False, unique=True, index=True)
    name = Column(String(200), nullable=False)  # Vd: "Size 10mm (108 hạt)", "Lư gốm xanh men ngọc"
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    weight_grams = Column(Integer, default=300)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="variants")
    reservations = relationship("StockReservation", back_populates="variant")

    @property
    def available_quantity(self) -> int:
        return max(0, self.stock_quantity - self.reserved_quantity)
