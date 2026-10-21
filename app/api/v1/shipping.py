from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.shipping import ShippingOrder
from app.schemas.shipping_dto import (
    ShippingFeeCalculateRequest, ShippingFeeCalculateResponse,
    ShippingCreateWaybillRequest, ShippingOrderResponse,
    ShippingWebhookPayload
)
from app.services.shipping_service import shipping_service

router = APIRouter(prefix="/shipping", tags=["Shipping & Tracking (Giao Vận & Vận Đơn)"])


@router.post("/calculate", response_model=ShippingFeeCalculateResponse, summary="Tính trước cước vận chuyển & thời gian giao hàng")
def calculate_shipping(req: ShippingFeeCalculateRequest):
    """
    Tính cước vận chuyển dựa trên địa chỉ nhận hàng và khối lượng đơn:
    - Miễn phí vận chuyển cho đơn hàng Trầm Hương từ 500,000đ trở lên.
    - Cước tiêu chuẩn nội thành: 25,000đ; liên tỉnh: 35,000đ.
    """
    res = shipping_service.calculate_shipping(
        province=req.province,
        district=req.district,
        ward=req.ward,
        weight_grams=req.weight_grams,
        subtotal=req.subtotal
    )
    return ShippingFeeCalculateResponse(**res)


@router.post("/waybills", response_model=ShippingOrderResponse, status_code=status.HTTP_201_CREATED, summary="Tạo vận đơn chính thức với hãng vận chuyển (GHN/GHTK)")
def create_waybill(req: ShippingCreateWaybillRequest, db: Session = Depends(get_db)):
    """
    Khi đơn hàng được xác nhận hoặc đang đóng gói (PROCESSING):
    - Tạo mã vận đơn chính thức với hãng GHN/GHTK.
    - Trả về mã tracking và link in phiếu gửi hàng.
    """
    shipping_order = shipping_service.create_shipping_order(
        db=db,
        order_id=req.order_id,
        carrier=req.carrier,
        package_dimensions=req.package_dimensions or "20x15x10",
        notes=req.notes or ""
    )
    db.commit()
    db.refresh(shipping_order)
    return ShippingOrderResponse.model_validate(shipping_order)


@router.get("/track/{tracking_number}", response_model=ShippingOrderResponse, summary="Tra cứu lộ trình vận đơn theo mã Tracking")
def track_shipment(tracking_number: str, db: Session = Depends(get_db)):
    """Tra cứu chi tiết hành trình vận chuyển của đơn hàng Trầm Hương."""
    shipping_order = db.query(ShippingOrder).filter(
        ShippingOrder.tracking_number == tracking_number
    ).first()

    if not shipping_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Không tìm thấy vận đơn '{tracking_number}'")

    return ShippingOrderResponse.model_validate(shipping_order)


@router.post("/webhook", summary="Webhook cập nhật trạng thái lộ trình từ Hãng Vận Chuyển (GHN/GHTK)")
def carrier_webhook(payload: ShippingWebhookPayload, db: Session = Depends(get_db)):
    """
    Hãng vận chuyển gọi Webhook khi đơn hàng đổi trạng thái:
    - PICKED -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED.
    - Tự động cập nhật trạng thái giao hàng và chuyển Order thành DELIVERED.
    """
    shipping_order = shipping_service.update_tracking_status(
        db=db,
        tracking_number=payload.tracking_number,
        status=payload.status,
        location=payload.location,
        description=payload.description
    )
    db.commit()
    return {
        "success": True,
        "tracking_number": payload.tracking_number,
        "current_status": shipping_order.status.value
    }
