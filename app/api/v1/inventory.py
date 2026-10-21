from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.product import ProductVariant
from app.models.order import StockReservation, ReservationStatus
from app.services.inventory_service import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory & Stock Reservation (Kho Hàng & Giữ Tồn Kho)"])


@router.get("/status", summary="Kiểm tra trạng thái tồn kho & số lượng giữ hàng")
def get_inventory_status(
    sku: str = Query(None, description="Lọc theo SKU sản phẩm"),
    db: Session = Depends(get_db)
):
    """
    Hiển thị thông tin kho chi tiết:
    - Tổng tồn kho vật lý (stock_quantity)
    - Số lượng đang bị giữ chờ thanh toán (reserved_quantity)
    - Tồn kho khả dụng để bán (available_quantity = stock - reserved)
    """
    query = db.query(ProductVariant)
    if sku:
        query = query.filter(ProductVariant.sku.ilike(f"%{sku}%"))

    variants = query.all()
    results = []
    for v in variants:
        results.append({
            "variant_id": v.id,
            "product_name": v.product.name if v.product else "N/A",
            "sku": v.sku,
            "variant_name": v.name,
            "total_stock": v.stock_quantity,
            "reserved_stock": v.reserved_quantity,
            "available_stock": v.available_quantity,
            "price": v.price,
            "weight_grams": v.weight_grams
        })
    return {"total_items": len(results), "inventory": results}


@router.get("/active-reservations", summary="Danh sách các phiên giữ hàng đang active")
def get_active_reservations(db: Session = Depends(get_db)):
    """Xem danh sách các đơn hàng đang được giữ chỗ trong kho cùng thời gian hết hạn (TTL)."""
    reservations = db.query(StockReservation).filter(
        StockReservation.status == ReservationStatus.ACTIVE
    ).all()

    return [
        {
            "id": r.id,
            "order_id": r.order_id,
            "variant_id": r.variant_id,
            "quantity": r.quantity,
            "expires_at": r.expires_at,
            "created_at": r.created_at
        }
        for r in reservations
    ]


@router.post("/cleanup-expired", summary="Kích hoạt thủ công giải phóng các phiên giữ hàng quá hạn (Worker trigger)")
def cleanup_expired_reservations(db: Session = Depends(get_db)):
    """Giải phóng toàn bộ các lượt giữ hàng đã hết hạn TTL (15 phút) và hủy đơn quá hạn."""
    count = inventory_service.cleanup_expired_reservations(db)
    return {
        "success": True,
        "message": f"Đã giải phóng thành công tồn kho cho {count} đơn hàng hết hạn thanh toán.",
        "cleaned_count": count
    }
