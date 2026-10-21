from app.models.product import ProductVariant
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.shipping import ShippingOrder, ShippingStatus
from app.models.return_refund import ReturnRequest, ReturnStatus, RefundRecord


def test_shipping_fee_calculation(client):
    """Kiểm tra logic tính phí vận chuyển: freeship đơn >= 500k, tính phí đơn < 500k."""
    # Đơn 200k (nhỏ hơn 500k) -> mất phí 25,000đ nội thành
    req1 = {
        "province": "Hồ Chí Minh",
        "district": "Quận 1",
        "ward": "Bến Nghé",
        "weight_grams": 400,
        "subtotal": 200000.0
    }
    resp1 = client.post("/api/v1/shipping/calculate", json=req1)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["is_free_shipping"] is False
    assert data1["shipping_fee"] == 25000.0

    # Đơn 600k (lớn hơn 500k) -> Miễn phí vận chuyển
    req2 = {
        "province": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Dịch Vọng",
        "weight_grams": 800,
        "subtotal": 600000.0
    }
    resp2 = client.post("/api/v1/shipping/calculate", json=req2)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["is_free_shipping"] is True
    assert data2["shipping_fee"] == 0.0


def test_shipping_waybill_creation_and_carrier_webhook(client, db_session):
    """
    Kiểm tra tạo vận đơn và Webhook đồng bộ lộ trình giao hàng:
    1. Tạo đơn hàng và chuyển sang PROCESSING
    2. Tạo vận đơn GHN -> nhận Tracking number
    3. Carrier Webhook báo DELIVERED -> Order tự động chuyển sang DELIVERED
    """
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "NHANG-KT-200N").first()

    order_payload = {
        "customer_name": "Trần Văn An",
        "customer_phone": "0981122334",
        "customer_email": "an.tran@zen.vn",
        "shipping_address": "100 Đường Trần Phú",
        "province": "Khánh Hòa",
        "district": "Nha Trang",
        "ward": "Lộc Thọ",
        "items": [
            {"product_variant_id": variant.id, "quantity": 1}
        ],
        "payment_method": "COD"
    }
    resp = client.post("/api/v1/orders", json=order_payload)
    order_id = resp.json()["order"]["id"]

    # 1. Tạo vận đơn giao hàng với GHN
    waybill_payload = {
        "order_id": order_id,
        "carrier": "GHN",
        "package_dimensions": "20x15x10",
        "notes": "Hàng nhang trầm dễ gãy, xin nhẹ tay"
    }
    wb_resp = client.post("/api/v1/shipping/waybills", json=waybill_payload)
    assert wb_resp.status_code == 201
    wb_data = wb_resp.json()
    tracking_number = wb_data["tracking_number"]
    assert "GHN-VN-" in tracking_number
    assert wb_data["status"] == "READY_TO_PICK"

    # Kiểm tra Order status chuyển sang SHIPPING
    db_session.expire_all()
    order = db_session.query(Order).filter(Order.id == order_id).first()
    assert order.order_status == OrderStatus.SHIPPING

    # 2. Hãng vận chuyển gửi Webhook báo giao thành công
    webhook_payload = {
        "tracking_number": tracking_number,
        "status": "DELIVERED",
        "location": "Bưu cục Nha Trang, Khánh Hòa",
        "description": "Bưu tá đã phát thành công gói hàng cho khách"
    }
    wh_resp = client.post("/api/v1/shipping/webhook", json=webhook_payload)
    assert wh_resp.status_code == 200

    # Kiểm tra Order status tự động cập nhật sang DELIVERED
    db_session.expire_all()
    order_after = db_session.query(Order).filter(Order.id == order_id).first()
    assert order_after.order_status == OrderStatus.DELIVERED
    assert order_after.payment_status == PaymentStatus.PAID  # COD đơn giao thành công tức đã thu tiền


def test_complete_return_and_refund_lifecycle(client, db_session):
    """
    Kiểm tra toàn bộ quy trình Đổi Trả & Hoàn Tiền (Return & Refund):
    1. Đơn hàng đã DELIVERED
    2. Khách gửi yêu cầu đổi trả vì hàng vỡ khi vận chuyển
    3. Admin duyệt yêu cầu (APPROVED)
    4. Kho nhận hàng, tự động cộng lại tồn kho (Restock) và kích hoạt hoàn tiền
    5. Đơn hàng chuyển sang REFUNDED
    """
    variant = db_session.query(ProductVariant).filter(ProductVariant.sku == "LU-DONG-SEN-CO").first()
    initial_stock = variant.stock_quantity

    # 1. Tạo đơn hàng và cập nhật tới DELIVERED
    order_payload = {
        "customer_name": "Phật tử Diệu Hạnh",
        "customer_phone": "0912233445",
        "customer_email": "dieuhanh@zen.vn",
        "shipping_address": "12 Đường Thiền Tự",
        "province": "Hồ Chí Minh",
        "district": "Bình Thạnh",
        "ward": "Phường 19",
        "items": [
            {"product_variant_id": variant.id, "quantity": 1}
        ],
        "payment_method": "COD"
    }
    o_resp = client.post("/api/v1/orders", json=order_payload)
    order_data = o_resp.json()["order"]
    order_id = order_data["id"]
    order_code = order_data["order_code"]
    order_item_id = order_data["items"][0]["id"]

    # Đưa đơn sang DELIVERED
    client.patch(f"/api/v1/orders/{order_id}/status", json={"target_status": "PROCESSING"})
    client.patch(f"/api/v1/orders/{order_id}/status", json={"target_status": "SHIPPING"})
    client.patch(f"/api/v1/orders/{order_id}/status", json={"target_status": "DELIVERED"})

    # 2. Khách hàng gửi yêu cầu đổi trả
    return_payload = {
        "order_code": order_code,
        "customer_name": "Phật tử Diệu Hạnh",
        "customer_phone": "0912233445",
        "customer_email": "dieuhanh@zen.vn",
        "reason": "DAMAGED_IN_TRANSIT",
        "customer_note": "Lư đồng bị móp nắp sen khi nhận hàng",
        "proof_images": ["https://storage.zenagarwood.vn/proofs/lu-mop.jpg"],
        "items": [
            {"order_item_id": order_item_id, "quantity": 1}
        ]
    }
    ret_resp = client.post("/api/v1/returns", json=return_payload)
    assert ret_resp.status_code == 201
    ret_data = ret_resp.json()
    return_id = ret_data["id"]
    return_code = ret_data["request_code"]
    assert ret_data["status"] == "REQUESTED"

    # 3. Admin duyệt yêu cầu đổi trả
    review_resp = client.post(f"/api/v1/returns/{return_id}/review", json={
        "status": "APPROVED",
        "admin_note": "Shop chấp thuận nhận hàng hoàn và hoàn tiền 100%",
        "return_shipping_code": "RET-GHN-88992"
    })
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "APPROVED"

    # 4. Kho nhận hàng, restock và hoàn tiền qua chuyển khoản ngân hàng
    refund_payload = {
        "refund_method": "BANK_TRANSFER",
        "bank_account_info": "19036789123 - Techcombank - DIEU HANH",
        "notes": "Hoàn tiền đơn hàng lỗi móp nắp"
    }
    ref_resp = client.post(f"/api/v1/returns/{return_id}/refund", json=refund_payload)
    assert ref_resp.status_code == 200
    ref_data = ref_resp.json()
    assert ref_data["status"] == "COMPLETED"
    assert ref_data["gateway_refund_id"] is not None

    # 5. Kiểm tra kết quả trong DB: tồn kho được hồi phục, đơn hàng REFUNDED
    db_session.expire_all()
    variant_after = db_session.query(ProductVariant).filter(ProductVariant.id == variant.id).first()
    assert variant_after.stock_quantity == initial_stock  # Đã hoàn trả tồn kho!

    order_after = db_session.query(Order).filter(Order.id == order_id).first()
    assert order_after.order_status == OrderStatus.REFUNDED
    assert order_after.payment_status == PaymentStatus.REFUNDED
