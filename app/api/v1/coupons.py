from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.coupon import Coupon
from app.schemas.coupon_dto import (
    CouponValidateRequest, CouponValidateResponse,
    CouponCreateRequest, CouponResponse
)
from app.services.coupon_service import coupon_service
from app.core.exceptions import InvalidCouponException

router = APIRouter(prefix="/coupons", tags=["Coupons & Discounts (Khuyến Mãi & Giảm Giá)"])


@router.post("/validate", response_model=CouponValidateResponse, summary="Kiểm tra & Tính toán giảm giá của Coupon trước khi đặt")
def validate_coupon(req: CouponValidateRequest, db: Session = Depends(get_db)):
    """
    Xác thực mã giảm giá:
    - Kiểm tra thời hạn, số lần dùng, điều kiện giá trị đơn hàng tối thiểu.
    - Trả về số tiền được giảm và tổng tiền sau giảm.
    """
    variant_ids = [item.product_variant_id for item in req.items] if req.items else None
    try:
        coupon, discount, msg = coupon_service.validate_coupon(
            db=db,
            code=req.code,
            subtotal=req.subtotal,
            customer_phone=req.customer_phone,
            customer_email=req.customer_email,
            variant_ids=variant_ids
        )
        return CouponValidateResponse(
            is_valid=True,
            code=coupon.code,
            discount_type=coupon.discount_type,
            discount_amount=discount,
            final_subtotal=max(0.0, req.subtotal - discount),
            message=msg
        )
    except InvalidCouponException as e:
        return CouponValidateResponse(
            is_valid=False,
            code=req.code,
            discount_type=None,
            discount_amount=0.0,
            final_subtotal=req.subtotal,
            message=e.message
        )


@router.get("", response_model=List[CouponResponse], summary="Danh sách các mã giảm giá đang kích hoạt")
def list_active_coupons(db: Session = Depends(get_db)):
    """Xem danh sách các mã khuyến mãi đang áp dụng của thương hiệu Trầm Hương Thiền An."""
    now = datetime.utcnow()
    coupons = db.query(Coupon).filter(
        Coupon.is_active == True,
        Coupon.start_date <= now,
        Coupon.end_date >= now
    ).all()
    return [CouponResponse.model_validate(c) for c in coupons]


@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED, summary="Tạo mới mã giảm giá (Admin)")
def create_coupon(req: CouponCreateRequest, db: Session = Depends(get_db)):
    existing = db.query(Coupon).filter(Coupon.code == req.code.upper()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Mã coupon '{req.code}' đã tồn tại.")

    coupon = Coupon(
        code=req.code.upper(),
        description=req.description,
        discount_type=req.discount_type,
        discount_value=req.discount_value,
        max_discount_amount=req.max_discount_amount,
        min_order_value=req.min_order_value,
        start_date=req.start_date or datetime.utcnow(),
        end_date=req.end_date,
        usage_limit_total=req.usage_limit_total,
        usage_limit_per_user=req.usage_limit_per_user,
        applicable_category_id=req.applicable_category_id
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return CouponResponse.model_validate(coupon)
