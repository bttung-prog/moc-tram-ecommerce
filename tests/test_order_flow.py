from app.models.product import ProductVariant
from app.models.order import Order, OrderStatus, PaymentStatus, PaymentMethod


def test_checkout_cod_order(client, db_session):
    """Kiểm tra đặt hàng qua hình thức COD: trạng thái CONFIRMED ngay, commit trừ kho."""
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "BODOAN-NAU").first()
    
    order_payload = {
        "customer_name": "Lê Văn Thiền",
        "customer_phone": "0908889999",
        "customer_email": "lethiendinh@gmail.com",
        "shipping_address": "45 Lê Duẩn",
        "province": "Đà Nẵng",
        "district": "Hải Châu",
        "ward": "Hải Châu 1",
        "items": [
            {"product_variant_id": variant.id, "quantity": 1}
        ],
        "payment_method": "COD",
        "customer_notes": "Xin bọc chống sốc kỹ lưỡng"
    }

    resp = client.post("/api/v1/orders", json=order_payload)
    assert resp.status_code == 201
    data = resp.json()

    order_data = data["order"]
    assert order_data["payment_method"] == "COD"
    assert order_data["order_status"] == "CONFIRMED"
    assert order_data["payment_status"] == "UNPAID"
    assert data["payment"]["gateway"] == "COD"


def test_checkout_vietqr_order(client, db_session):
    """Kiểm tra đặt hàng qua VietQR: trả về mã QR NAPAS 247, trạng thái AWAITING_PAYMENT."""
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "LU-DONG-SEN-CO").first()

    order_payload = {
        "customer_name": "Hoàng Tuệ An",
        "customer_phone": "0918765432",
        "customer_email": "tuean@zenagarwood.vn",
        "shipping_address": "12 Nguyễn Huệ",
        "province": "Hồ Chí Minh",
        "district": "Quận 1",
        "ward": "Bến Nghé",
        "items": [
            {"product_variant_id": variant.id, "quantity": 1}
        ],
        "coupon_code": "THIENAN10",
        "payment_method": "VIETQR"
    }

    resp = client.post("/api/v1/orders", json=order_payload)
    assert resp.status_code == 201
    data = resp.json()

    order_data = data["order"]
    assert order_data["order_status"] == "AWAITING_PAYMENT"
    assert order_data["discount_amount"] > 0

    payment_data = data["payment"]
    assert payment_data["gateway"] == "VIETQR"
    assert payment_data["vietqr"] is not None
    assert payment_data["vietqr"]["bank_id"] == "MB"
    assert payment_data["vietqr"]["account_no"] == "0399888999"
    assert payment_data["vietqr"]["qr_image_url"] is not None
    assert payment_data["vietqr"]["qr_base64"] is not None
    assert order_data["order_code"] in payment_data["vietqr"]["transfer_content"]


def test_checkout_paypal_order(client, db_session):
    """Kiểm tra đặt hàng qua PayPal: tạo đơn PayPal sandbox v2, quy đổi VND -> USD."""
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "CHUONG-SING-12CM").first()

    order_payload = {
        "customer_name": "Zen Master Overseas",
        "customer_phone": "0901112233",
        "customer_email": "zenmaster@global.org",
        "shipping_address": "100 California Way",
        "province": "Hồ Chí Minh",
        "district": "Quận 7",
        "ward": "Tân Phong",
        "items": [
            {"product_variant_id": variant.id, "quantity": 1}
        ],
        "payment_method": "PAYPAL"
    }

    resp = client.post("/api/v1/orders", json=order_payload)
    assert resp.status_code == 201
    data = resp.json()

    payment_data = data["payment"]
    assert payment_data["gateway"] == "PAYPAL"
    assert payment_data["paypal"] is not None
    assert payment_data["paypal"]["amount_usd"] > 0
    assert payment_data["paypal"]["approve_url"] is not None


def test_order_state_machine_transitions(client, db_session):
    """Kiểm tra máy trạng thái đơn hàng (Order State Machine) và ngăn chặn chuyển đổi bất hợp pháp."""
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "NHANG-KT-100N").first()

    order_payload = {
        "customer_name": "Phạm Chánh Tín",
        "customer_phone": "0977665544",
        "customer_email": "chanhtin@zen.vn",
        "shipping_address": "88 Đường Thiền Quang",
        "province": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Nguyễn Du",
        "items": [
            {"product_variant_id": variant.id, "quantity": 1}
        ],
        "payment_method": "COD"
    }
    resp = client.post("/api/v1/orders", json=order_payload)
    order_id = resp.json()["order"]["id"]

    # 1. Chuyển từ CONFIRMED -> PROCESSING (Hợp lệ)
    step1 = client.patch(f"/api/v1/orders/{order_id}/status", json={
        "target_status": "PROCESSING",
        "reason": "Bắt đầu đóng gói nhang trầm"
    })
    assert step1.status_code == 200
    assert step1.json()["order_status"] == "PROCESSING"

    # 2. Chuyển từ PROCESSING -> SHIPPING (Hợp lệ)
    step2 = client.patch(f"/api/v1/orders/{order_id}/status", json={
        "target_status": "SHIPPING",
        "reason": "Bàn giao bưu tá"
    })
    assert step2.status_code == 200
    assert step2.json()["order_status"] == "SHIPPING"

    # 3. Chuyển từ SHIPPING -> DELIVERED (Hợp lệ)
    step3 = client.patch(f"/api/v1/orders/{order_id}/status", json={
        "target_status": "DELIVERED",
        "reason": "Khách đã nhận hàng"
    })
    assert step3.status_code == 200
    assert step3.json()["order_status"] == "DELIVERED"

    # 4. Cố tình chuyển từ DELIVERED -> CANCELLED (Bất hợp pháp, ném 400 Bad Request)
    illegal_step = client.patch(f"/api/v1/orders/{order_id}/status", json={
        "target_status": "CANCELLED",
        "reason": "Khách hàng muốn hủy sau khi đã nhận hàng"
    })
    assert illegal_step.status_code == 400
    assert illegal_step.json()["code"] == "INVALID_STATUS_TRANSITION"
