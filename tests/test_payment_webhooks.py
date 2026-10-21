from app.models.product import ProductVariant
from app.models.order import Order, OrderStatus, PaymentStatus, StockReservation, ReservationStatus


def test_sepay_vietqr_webhook_success_and_idempotency(client, db_session):
    """
    Kiểm tra Webhook SePAY / VietQR:
    1. Đặt đơn hàng thanh toán VietQR (AWAITING_PAYMENT, stock reservation ACTIVE)
    2. Gửi Webhook chuyển khoản khớp số tiền & mã đơn
    3. Kiểm tra Order chuyển sang CONFIRMED, payment sang PAID, stock reservation COMMITTED
    4. Gửi lại webhook lần 2 (Idempotency test) -> Trả về already_processed, không lỗi
    """
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "TRAM-108-10MM").first()
    
    # 1. Đặt đơn hàng
    order_payload = {
        "customer_name": "Phật tử Diệu Hòa",
        "customer_phone": "0934567890",
        "customer_email": "dieuhoa@zen.vn",
        "shipping_address": "88 Đường Nam Kỳ Khởi Nghĩa",
        "province": "Hồ Chí Minh",
        "district": "Quận 1",
        "ward": "Bến Thành",
        "items": [
            {"product_variant_id": variant.id, "quantity": 1}
        ],
        "payment_method": "VIETQR"
    }

    resp = client.post("/api/v1/orders", json=order_payload)
    assert resp.status_code == 201
    order_data = resp.json()["order"]
    order_code = order_data["order_code"]
    order_id = order_data["id"]
    total_amount = order_data["total_amount"]

    # 2. Bắn Webhook SePAY báo khách chuyển khoản thành công
    webhook_payload = {
        "id": 883921,
        "gateway": "MBBank",
        "transactionDate": "2026-10-21 08:35:00",
        "accountNumber": "0399888999",
        "transferType": "in",
        "transferAmount": total_amount,
        "content": f"MB-FT99823 Chuyen tien tram huong {order_code}",
        "referenceCode": "REF-MB-8829103"
    }

    headers = {"Authorization": "Bearer sepay_secret_token_zen_agarwood_2026"}
    wh_resp = client.post("/api/v1/payments/sepay/webhook", json=webhook_payload, headers=headers)
    assert wh_resp.status_code == 200
    wh_data = wh_resp.json()
    assert wh_data["success"] is True
    assert wh_data["result"]["status"] == "success"

    # Kiểm tra trạng thái trong DB
    db_session.expire_all()
    order = db_session.query(Order).filter(Order.id == order_id).first()
    assert order.order_status == OrderStatus.CONFIRMED
    assert order.payment_status == PaymentStatus.PAID

    # Kiểm tra reservation đã được COMMITTED
    res = db_session.query(StockReservation).filter(StockReservation.order_id == order_id).first()
    assert res.status == ReservationStatus.COMMITTED

    # 3. Thử nghiệm Idempotency: Gửi lại webhook một lần nữa
    wh_resp_dup = client.post("/api/v1/payments/sepay/webhook", json=webhook_payload, headers=headers)
    assert wh_resp_dup.status_code == 200
    dup_data = wh_resp_dup.json()
    assert dup_data["result"]["status"] == "already_processed"


def test_sepay_webhook_partial_payment_warning(client, db_session):
    """Kiểm tra webhook cảnh báo khi số tiền chuyển khoản không đủ tổng đơn hàng."""
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "LU-DONG-SEN-VANG").first()

    order_payload = {
        "customer_name": "Trần Tâm An",
        "customer_phone": "0909998877",
        "customer_email": "taman@zen.vn",
        "shipping_address": "50 Nguyễn Thị Minh Khai",
        "province": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Điện Biên",
        "items": [
            {"product_variant_id": variant.id, "quantity": 1}
        ],
        "payment_method": "VIETQR"
    }

    resp = client.post("/api/v1/orders", json=order_payload)
    order_code = resp.json()["order"]["order_code"]
    total_amount = resp.json()["order"]["total_amount"]

    # Khách chỉ chuyển 100,000đ (thiếu so với giá trị đơn)
    webhook_payload = {
        "id": 883922,
        "gateway": "MBBank",
        "transactionDate": "2026-10-21 08:36:00",
        "accountNumber": "0399888999",
        "transferType": "in",
        "transferAmount": 100000.0,
        "content": f"Chuyen tien {order_code}",
        "referenceCode": "REF-MB-8829104"
    }

    wh_resp = client.post("/api/v1/payments/sepay/webhook", json=webhook_payload)
    assert wh_resp.status_code == 200
    result = wh_resp.json()["result"]
    assert result["status"] == "partial_payment_warning"
    assert result["transferred"] == 100000.0


def test_paypal_capture_flow(client, db_session):
    """Kiểm tra capture tiền PayPal xác nhận đơn hàng thành công."""
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "BODOAN-LAM").first()

    order_payload = {
        "customer_name": "International Monk",
        "customer_phone": "0911223344",
        "customer_email": "monk@zen.org",
        "shipping_address": "Temple Way",
        "province": "Hồ Chí Minh",
        "district": "Quận 1",
        "ward": "Bến Nghé",
        "items": [
            {"product_variant_id": variant.id, "quantity": 1}
        ],
        "payment_method": "PAYPAL"
    }

    resp = client.post("/api/v1/orders", json=order_payload)
    order_id = resp.json()["order"]["id"]
    pp_order_id = resp.json()["payment"]["paypal"]["paypal_order_id"]

    # Client gửi yêu cầu capture
    cap_resp = client.post(f"/api/v1/payments/paypal/capture?paypal_order_id={pp_order_id}")
    assert cap_resp.status_code == 200
    assert cap_resp.json()["success"] is True

    # Kiểm tra đơn hàng đã PAID và CONFIRMED
    db_session.expire_all()
    order = db_session.query(Order).filter(Order.id == order_id).first()
    assert order.order_status == OrderStatus.CONFIRMED
    assert order.payment_status == PaymentStatus.PAID
