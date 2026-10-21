from datetime import datetime, timedelta
from app.models.product import ProductVariant
from app.models.order import Order, OrderStatus, StockReservation, ReservationStatus
from app.services.inventory_service import inventory_service


def test_stock_reservation_lifecycle(client, db_session):
    """
    Kiểm tra vòng đời giữ hàng (Stock Reservation):
    1. Kiểm tra tồn ban đầu
    2. Đặt đơn VietQR -> Stock được giữ (reserved_quantity tăng, available giảm)
    3. Hủy đơn -> Hàng được nhả lại kho (reserved_quantity giảm về 0)
    """
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "TRAM-108-8MM").first()
    initial_stock = variant.stock_quantity
    initial_reserved = variant.reserved_quantity
    initial_available = variant.available_quantity

    # 1. Đặt đơn mua 2 chuỗi vòng trầm
    order_payload = {
        "customer_name": "Phật tử Tuệ Minh",
        "customer_phone": "0912345678",
        "customer_email": "tueminh@zen.vn",
        "shipping_address": "Chùa Từ Đàm, Đường Sư Liễu Quán",
        "province": "Thừa Thiên Huế",
        "district": "Thành phố Huế",
        "ward": "Phường Trường An",
        "items": [
            {"product_variant_id": variant.id, "quantity": 2}
        ],
        "payment_method": "VIETQR"
    }

    resp = client.post("/api/v1/orders", json=order_payload)
    assert resp.status_code == 201
    data = resp.json()
    order_code = data["order"]["order_code"]
    order_id = data["order"]["id"]

    # Refresh dữ liệu từ DB
    db_session.expire_all()
    v_after_order = db_session.query(ProductVariant).filter(ProductVariant.id == variant.id).first()
    assert v_after_order.stock_quantity == initial_stock  # Chưa trừ tồn vật lý
    assert v_after_order.reserved_quantity == initial_reserved + 2  # Đã khóa giữ 2 chiếc
    assert v_after_order.available_quantity == initial_available - 2  # Khả dụng giảm 2

    # Kiểm tra bản ghi StockReservation
    reservation = db_session.query(StockReservation).filter(
        StockReservation.order_id == order_id,
        StockReservation.variant_id == variant.id
    ).first()
    assert reservation is not None
    assert reservation.status == ReservationStatus.ACTIVE
    assert reservation.quantity == 2

    # 2. Hủy đơn hàng
    cancel_resp = client.post(f"/api/v1/orders/{order_id}/cancel", json={
        "reason": "Khách muốn đổi sang chuỗi 108 hạt 10mm",
        "cancelled_by": "CUSTOMER"
    })
    assert cancel_resp.status_code == 200

    # Refresh dữ liệu sau khi hủy
    db_session.expire_all()
    v_after_cancel = db_session.query(ProductVariant).filter(ProductVariant.id == variant.id).first()
    assert v_after_cancel.reserved_quantity == initial_reserved  # Giữ hàng trở về như cũ
    assert v_after_cancel.available_quantity == initial_available  # Tồn khả dụng được phục hồi

    # Bản ghi reservation chuyển sang RELEASED
    db_session.refresh(reservation)
    assert reservation.status == ReservationStatus.RELEASED


def test_insufficient_stock_rejection(client, db_session):
    """Kiểm tra từ chối đặt hàng khi vượt quá tồn kho khả dụng."""
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "CHUONG-SING-16CM").first()
    available = variant.available_quantity

    order_payload = {
        "customer_name": "Nguyễn Thiền Tâm",
        "customer_phone": "0987654321",
        "customer_email": "thientam@zen.vn",
        "shipping_address": "123 Đường Nam Kỳ Khởi Nghĩa",
        "province": "Hồ Chí Minh",
        "district": "Quận 3",
        "ward": "Phường Võ Thị Sáu",
        "items": [
            {"product_variant_id": variant.id, "quantity": available + 50}  # Vượt quá tồn kho
        ],
        "payment_method": "VIETQR"
    }

    resp = client.post("/api/v1/orders", json=order_payload)
    assert resp.status_code == 400
    data = resp.json()
    assert data["code"] == "INSUFFICIENT_STOCK"
    assert "không đủ tồn kho" in data["message"]


def test_cleanup_expired_stock_reservations(client, db_session):
    """Kiểm tra worker giải phóng giữ hàng khi hết hạn TTL (quá 15 phút chưa thanh toán)."""
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "NU-TRAM-40V").first()
    
    # 1. Tạo đơn đặt nụ trầm
    order_payload = {
        "customer_name": "Trần An Nhiên",
        "customer_phone": "0933221100",
        "customer_email": "annhien@zen.vn",
        "shipping_address": "88 Đường Hùng Vương",
        "province": "Khánh Hòa",
        "district": "Nha Trang",
        "ward": "Lộc Thọ",
        "items": [
            {"product_variant_id": variant.id, "quantity": 5}
        ],
        "payment_method": "VIETQR"
    }
    resp = client.post("/api/v1/orders", json=order_payload)
    assert resp.status_code == 201
    order_id = resp.json()["order"]["id"]

    # 2. Giả lập phiên giữ hàng đã hết hạn (chỉnh lùi expires_at 30 phút về quá khứ)
    db_session.expire_all()
    res = db_session.query(StockReservation).filter(StockReservation.order_id == order_id).first()
    res.expires_at = datetime.utcnow() - timedelta(minutes=30)
    db_session.commit()

    # 3. Kích hoạt dọn dẹp
    cleanup_resp = client.post("/api/v1/inventory/cleanup-expired")
    assert cleanup_resp.status_code == 200
    assert cleanup_resp.json()["cleaned_count"] >= 1

    # 4. Kiểm tra đơn hàng tự động chuyển sang CANCELLED và reservation chuyển sang RELEASED
    db_session.expire_all()
    order = db_session.query(Order).filter(Order.id == order_id).first()
    assert order.order_status == OrderStatus.CANCELLED
    assert "Quá thời hạn" in order.cancel_reason

    res_after = db_session.query(StockReservation).filter(StockReservation.id == res.id).first()
    assert res_after.status == ReservationStatus.RELEASED
