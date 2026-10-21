from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.product import Product, Category, ProductVariant
from app.schemas.product_dto import (
    ProductRead, ProductCreate,
    CategoryRead, CategoryCreate,
    ProductVariantRead
)

router = APIRouter(prefix="/products", tags=["Products & Catalog (Sản Phẩm & Danh Mục Trầm Hương & Thiền Định)"])


@router.get("", response_model=List[ProductRead], summary="Danh sách sản phẩm Trầm Hương & Dụng Cụ Thiền Định")
def list_products(
    category_id: Optional[int] = Query(None, description="Lọc theo danh mục"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên sản phẩm"),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    products = query.all()
    return [ProductRead.model_validate(p) for p in products]


@router.get("/{id_or_slug}", response_model=ProductRead, summary="Chi tiết sản phẩm theo ID hoặc Slug")
def get_product(id_or_slug: str, db: Session = Depends(get_db)):
    if id_or_slug.isdigit():
        product = db.query(Product).filter(Product.id == int(id_or_slug), Product.is_active == True).first()
    else:
        product = db.query(Product).filter(Product.slug == id_or_slug, Product.is_active == True).first()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy sản phẩm yêu cầu")
    return ProductRead.model_validate(product)


@router.get("/categories/all", response_model=List[CategoryRead], summary="Danh sách danh mục sản phẩm (Trầm, Nhang, Chuông Xoay, Bồ Đoàn...)")
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return [CategoryRead.model_validate(c) for c in categories]
