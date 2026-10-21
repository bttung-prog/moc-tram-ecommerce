def test_validate_valid_coupon_thienan10(client):
    """Kiểm tra mã THIENAN10 giảm 10% (đơn 800k giảm 80k)."""
    payload = {
        "code": "THIENAN10",
        "subtotal": 800000.0,
        "customer_phone": "0901234567",
        "customer_email": "an.nguyen@thienan.vn",
        "items": []
    }
    response = client.post("/api/v1/coupons/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["code"] == "THIENAN10"
    assert data["discount_amount"] == 80000.0
    assert data["final_subtotal"] == 720000.0


def test_validate_coupon_cap_discount(client):
    """Kiểm tra trần giảm giá tối đa (đơn 2.000.000đ giảm 10% = 200k nhưng capped ở 100k)."""
    payload = {
        "code": "THIENAN10",
        "subtotal": 2000000.0,
        "customer_phone": "0901234567",
        "customer_email": "an.nguyen@thienan.vn",
        "items": []
    }
    response = client.post("/api/v1/coupons/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["discount_amount"] == 100000.0  # Capped at max_discount_amount
    assert data["final_subtotal"] == 1900000.0


def test_validate_coupon_min_order_value_fail(client):
    """Kiểm tra đơn hàng chưa đạt giá trị tối thiểu (THIENAN10 yêu cầu tối thiểu 300k, đơn 200k bị từ chối)."""
    payload = {
        "code": "THIENAN10",
        "subtotal": 200000.0,
        "customer_phone": "0901234567",
        "customer_email": "an.nguyen@thienan.vn",
        "items": []
    }
    response = client.post("/api/v1/coupons/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert data["discount_amount"] == 0.0
    assert "tối thiểu 300,000" in data["message"]


def test_validate_nonexistent_coupon(client):
    """Kiểm tra mã giảm giá không tồn tại."""
    payload = {
        "code": "KHONG_TON_TAI_999",
        "subtotal": 1000000.0,
        "customer_phone": "0901234567",
        "customer_email": "an.nguyen@thienan.vn",
        "items": []
    }
    response = client.post("/api/v1/coupons/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert "không tồn tại" in data["message"]


def test_list_active_coupons(client):
    """Kiểm tra lấy danh sách các mã giảm giá đang kích hoạt."""
    response = client.get("/api/v1/coupons")
    assert response.status_code == 200
    coupons = response.json()
    assert len(coupons) >= 4
    codes = [c["code"] for c in coupons]
    assert "THIENAN10" in codes
    assert "TRAMVIP500" in codes
    assert "FREESHIP" in codes
    assert "HOASEN20" in codes
