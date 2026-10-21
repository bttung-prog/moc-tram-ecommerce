from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class CategoryBase(BaseModel):
    name: str = Field(..., example="Trầm Hương Tự Nhiên")
    slug: str = Field(..., example="tram-huong-tu-nhien")
    description: Optional[str] = Field(None, example="Trầm hương rừng tự nhiên Khánh Hòa, Tiên Phước")


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProductVariantBase(BaseModel):
    sku: str = Field(..., example="TRAM-VONG-108-10MM")
    name: str = Field(..., example="Chuỗi 108 hạt 10mm chìm nước")
    price: float = Field(..., ge=0, example=1850000.0)
    stock_quantity: int = Field(..., ge=0, example=25)
    weight_grams: int = Field(300, ge=1, example=150)


class ProductVariantCreate(ProductVariantBase):
    pass


class ProductVariantRead(ProductVariantBase):
    id: int
    product_id: int
    reserved_quantity: int
    available_quantity: int
    is_active: bool

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str = Field(..., example="Vòng Tay Trầm Hương Tự Nhiên 108 Hạt")
    slug: str = Field(..., example="vong-tay-tram-huong-108-hat")
    description: Optional[str] = Field(None, example="Chuỗi 108 hạt trầm hương tụ khí linh thiêng, định tâm an thần khi ngồi thiền")
    origin: str = Field("Khánh Hòa, Việt Nam", example="Khánh Hòa, Việt Nam")
    fragrance_notes: Optional[str] = Field("Hương ngọt sâu, thanh nhẹ, lưu hương vĩnh viễn", example="Thanh ngọt, thiền tịnh")
    base_price: float = Field(..., ge=0, example=1850000.0)
    weight_grams: int = Field(300, example=300)


class ProductCreate(ProductBase):
    category_id: int
    variants: List[ProductVariantCreate] = []


class ProductRead(ProductBase):
    id: int
    category_id: int
    is_active: bool
    created_at: datetime
    category: Optional[CategoryRead] = None
    variants: List[ProductVariantRead] = []

    class Config:
        from_attributes = True
