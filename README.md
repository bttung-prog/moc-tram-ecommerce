# 🪔 Tĩnh Tâm Các - Hệ Thống Quản Lý Đơn Hàng Trực Tuyến (Zen Agarwood OMS)
> **Backend Developer (Business Modules & Integration)**  
> Dự án Kinh doanh Trầm Hương Tự Nhiên & Dụng Cụ Thiền Định

---

## 📌 1. Giới Thiệu Dự Án

Hệ thống Backend phục vụ quản lý đơn hàng trực tuyến chuyên biệt cho thương hiệu **Tĩnh Tâm Các - Trầm Hương Thiền An**, kinh doanh các sản phẩm thiền định cao cấp:
- **Trầm Hương Tự Nhiên**: Chuỗi vòng 108 hạt chìm nước, tinh dầu trầm kỳ nam, trầm miếng xông hương.
- **Nhang & Nụ Trầm Thiền**: Nhang không tăm Khánh Hòa, nụ trầm thác khói ngược thư giãn phòng thiền.
- **Dụng Cụ Xông Đốt**: Lư đồng hoa sen nguyên khối chạm nổi, lư gốm tử sa Bát Tràng.
- **Chuông Xoay & Pháp Khí**: Chuông xoay Full Moon 7 kim loại từ Nepal kèm chày & đệm gấm thủ công.
- **Bồ Đoàn & Toạ Cụ**: Bồ đoàn vỏ đậu xanh 100% organic, toạ cụ chống tê mỏi cột sống khi tọa thiền.

---

## 🚀 2. Các Module Nghiệp Vụ Cốt Lõi (Business Modules)

1. **Order Management & Checkout Flow**:
   - Quản lý vòng đời đơn hàng qua **State Machine** chuẩn mực (`PENDING`, `AWAITING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `SHIPPING`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `RETURN_REQUESTED`, `RETURNED`, `REFUNDED`).
   - Lưu vết lịch sử thay đổi trạng thái (Audit History Log) chi tiết từng bước.
   - Hỗ trợ lọc đơn theo trạng thái, số điện thoại, email và phân trang.

2. **Inventory & Stock Reservation (Giữ Kho Có Thời Hạn)**:
   - Cơ chế **Concurrency-safe & ACID**: Khóa giữ số lượng hàng khi khách tiến hành thanh toán trực tuyến với **TTL 15 phút**.
   - Tự động trừ kho vĩnh viễn (Commit) khi thanh toán thành công.
   - Tự động giải phóng tồn kho (Release) khi hủy đơn hoặc quá hạn thanh toán.
   - **Background Worker**: Tác vụ nền chạy định kỳ quét và giải phóng các đơn hàng quá hạn thanh toán.
   - Hỗ trợ nhập lại kho (Restock) khi khách hàng đổi trả hàng.

3. **Multi-Gateway Payment Integration (Thanh Toán Đa Kênh)**:
   - **COD**: Thanh toán khi nhận hàng, commit trừ kho ngay lập tức, chuyển tiền thu hộ vào phiếu vận đơn.
   - **VietQR (NAPAS 247)**: Tự động sinh chuỗi mã VietQR và render ảnh mã QR động (Quick Link & Base64 PNG offline).
   - **SePAY / Ngân Hàng Webhook**: Nhận thông báo biến động số dư, tự động khớp mã đơn `DHxxxxxx`, kiểm tra số tiền, cập nhật trạng thái `PAID` và **chống lặp (Idempotent)**.
   - **PayPal REST API v2**: Tạo đơn, link thanh toán ngoại tệ USD cho khách quốc tế/kiều bào, capture và hoàn tiền.

4. **Coupon Validation & Discount Logic (Khuyến Mãi)**:
   - Các loại chiết khấu: Giảm theo % (có trần tối đa), giảm số tiền cố định, miễn phí vận chuyển (Freeship).
   - Kiểm tra hạn dùng, lượt dùng toàn hệ thống, giới hạn mỗi khách hàng, giá trị đơn tối thiểu.
   - Áp dụng riêng theo danh mục sản phẩm (ví dụ: chỉ áp dụng cho Chuông Xoay hoặc Bồ Đoàn).

5. **Shipping & Waybill Tracking (Giao Vận & Vận Đơn)**:
   - Tính phí ship thông minh: Miễn phí vận chuyển cho đơn từ 500,000đ; tính phí theo khu vực nội thành / ngoại thành và khối lượng gói hàng.
   - Tích hợp adapter GHN (Giao Hàng Nhanh) / GHTK, sinh mã vận đơn `GHN-VN-xxxxxx` và link in phiếu gửi.
   - Webhook nhận lộ trình từ bưu tá (`PICKED` -> `IN_TRANSIT` -> `OUT_FOR_DELIVERY` -> `DELIVERED`), tự động cập nhật đơn hàng thành công.

6. **Return & Refund (Đổi Trả & Hoàn Tiền)**:
   - Quy trình đổi trả thẩm định: Khách gửi yêu cầu kèm hình ảnh bằng chứng (nứt vỡ lư đồng/gốm, nhầm size vòng).
   - Admin duyệt (`APPROVED` / `REJECTED`).
   - Kho nhận hàng: Tự động nhập kho trở lại (Restock items) và kích hoạt lệnh hoàn tiền tự động qua PayPal Refund API hoặc chuyển khoản ngân hàng.

---

## 🛠️ 3. Công Nghệ Sử Dụng

- **Ngôn ngữ**: Python 3.14 / 3.12+
- **Framework**: FastAPI (Asynchronous, High Performance)
- **ORM & Database**: SQLAlchemy 2.0 (hỗ trợ SQLite mặc định và sẵn sàng PostgreSQL/MySQL)
- **Validation**: Pydantic v2 (Strict typing, DTO serialization)
- **Tài liệu API**: Swagger UI (OpenAPI 3.0) & ReDoc
- **Testing**: Pytest & Pytest-Asyncio (18 test cases bao phủ toàn bộ luồng nghiệp vụ)
- **Tiện ích**: QRCode, Pillow, Httpx, Python-dotenv

---

## 📦 4. Cấu Trúc Thư Mục Dự Án

```
d:/project/
├── app/
│   ├── api/v1/                  # RESTful API Endpoints
│   │   ├── orders.py            # /api/v1/orders
│   │   ├── payments.py          # /api/v1/payments (VietQR, PayPal, Webhooks)
│   │   ├── inventory.py         # /api/v1/inventory (Stock status, worker trigger)
│   │   ├── coupons.py           # /api/v1/coupons (Validate, list, create)
│   │   ├── shipping.py          # /api/v1/shipping (Calculate fee, waybills, tracking)
│   │   ├── returns.py           # /api/v1/returns (Return request, review, refund)
│   │   ├── products.py          # /api/v1/products (Catalog Trầm Hương & Thiền Định)
│   │   └── router.py            # Tổng hợp Router v1
│   ├── core/
│   │   ├── database.py          # Engine, SessionLocal, get_db dependency
│   │   ├── exceptions.py        # Domain Custom Exceptions
│   │   ├── security.py          # Webhook HMAC & Admin API Key
│   │   └── scheduler.py         # Background Worker quét giữ kho hết hạn
│   ├── integrations/            # Cổng bên thứ ba & Client Adapters
│   │   ├── vietqr_client.py     # NAPAS 247 VietQR generator & SePAY parser
│   │   ├── paypal_client.py     # PayPal REST API v2 Checkout & Refund
│   │   └── shipping_client.py   # GHN / GHTK Carrier Adapter
│   ├── models/                  # SQLAlchemy ORM Models
│   │   ├── product.py           # Category, Product, ProductVariant
│   │   ├── order.py             # Order, OrderItem, OrderStatusHistory, StockReservation
│   │   ├── payment.py           # PaymentTransaction
│   │   ├── coupon.py            # Coupon, CouponUsage
│   │   ├── shipping.py          # ShippingOrder, ShippingTrackingHistory
│   │   └── return_refund.py     # ReturnRequest, ReturnItem, RefundRecord
│   ├── schemas/                 # Pydantic Request / Response DTOs
│   ├── services/                # Business Logic Services
│   │   ├── order_service.py
│   │   ├── inventory_service.py
│   │   ├── coupon_service.py
│   │   ├── payment_service.py
│   │   ├── shipping_service.py
│   │   └── return_refund_service.py
│   ├── seed/
│   │   └── seed_data.py         # Dữ liệu mẫu chuẩn Trầm Hương & Thiền Định
│   ├── config.py                # Cấu hình Pydantic BaseSettings (.env)
│   └── main.py                  # Điểm khởi động FastAPI & Lifespan
├── docs/
│   ├── ARCHITECTURE.md          # Tài liệu Thiết Kế Hệ Thống Chi Tiết
│   └── Postman_Collection.json  # File Import Postman đầy đủ tất cả luồng API
├── tests/                       # Bộ kiểm thử Pytest tự động
│   ├── conftest.py
│   ├── test_coupons.py
│   ├── test_inventory_reservation.py
│   ├── test_order_flow.py
│   ├── test_payment_webhooks.py
│   └── test_shipping_and_returns.py
├── .env.example
├── pytest.ini
├── requirements.txt
└── README.md
```

---

## ⚡ 5. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Bước 1: Kích hoạt môi trường ảo Python
```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Hoặc nếu chưa có venv:
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
```

### Bước 2: Nạp dữ liệu mẫu (Seed Data)
Cơ sở dữ liệu mẫu bao gồm đầy đủ danh mục, sản phẩm trầm hương tự nhiên, chuông xoay, nụ trầm, lư gốm tử sa và các mã giảm giá:
```powershell
python -m app.seed.seed_data
```

### Bước 3: Khởi động Server FastAPI
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Truy cập ngay trên trình duyệt:
- **Tài liệu Swagger UI tương tác**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Tài liệu ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Kiểm tra trạng thái máy chủ (Health Check)**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 6. Chạy Test Suite Tự Động

Chạy bộ kiểm thử toàn diện với Pytest:
```powershell
pytest -v
```

Kết quả: **18/18 test cases PASSED (100%)** bao gồm:
- ✅ Xác thực mã giảm giá, giới hạn trần % và đơn hàng tối thiểu
- ✅ Quy trình giữ kho nguyên tử (Stock Reservation), chống oversell và nhả kho khi hủy
- ✅ Worker tự động giải phóng tồn kho khi hết hạn TTL 15 phút
- ✅ Đặt hàng COD, VietQR và PayPal v2
- ✅ Kiểm soát máy trạng thái đơn hàng (Order State Machine)
- ✅ Webhook SePAY/VietQR nhận tiền và chống lặp (Idempotency)
- ✅ Tính cước giao hàng, tạo vận đơn GHN và Webhook đồng bộ lộ trình
- ✅ Quy trình đổi trả hàng: duyệt đơn, nhập kho lại (Restock) và hoàn tiền

---

## 📮 7. Sử Dụng Postman Collection

Trong thư mục `docs/`, có sẵn file `Postman_Collection.json`.
1. Mở phần mềm **Postman**.
2. Chọn **Import** -> Kéo thả file `docs/Postman_Collection.json`.
3. Bộ sưu tập đã được tổ chức theo 7 thư mục nghiệp vụ có sẵn mẫu Request, Headers và Body để demo trực tiếp!
