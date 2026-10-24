# 🪔 Mộc Trầm — Hệ Thống Quản Lý Đơn Hàng Trực Tuyến (OMS)
> **Backend Developer (Business Modules & Integration)**<br>
> Dự án Kinh doanh Trầm Hương Tự Nhiên & Dụng Cụ Thiền Định

---

## 📌 1. Giới Thiệu Dự Án

Hệ thống Backend phục vụ quản lý đơn hàng trực tuyến chuyên biệt cho thương hiệu **Mộc Trầm - Trầm Hương Thiền An**, kinh doanh các sản phẩm thiền định cao cấp:
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

4. **Authentication & User Management (Xác Thực & Quản Lý Người Dùng)**:
   - Đăng ký / đăng nhập bằng email hoặc số điện thoại + mật khẩu.
   - JWT Access Token + Refresh Token (tự động làm mới phiên đăng nhập).
   - Quên mật khẩu & đặt lại qua OTP 8 chữ số gửi về email (TTL 5 phút, tối đa 5 lần nhập sai).
   - Role-based Access Control (RBAC): `customer`, `staff`, `warehouse_staff`, `admin`.
   - Quản lý hồ sơ cá nhân: cập nhật tên, số điện thoại.

5. **Coupon Validation & Discount Logic (Khuyến Mãi)**:
   - Các loại chiết khấu: Giảm theo % (có trần tối đa), giảm số tiền cố định, miễn phí vận chuyển (Freeship).
   - Kiểm tra hạn dùng, lượt dùng toàn hệ thống, giới hạn mỗi khách hàng, giá trị đơn tối thiểu.
   - Áp dụng riêng theo danh mục sản phẩm.

6. **Shipping & Waybill Tracking (Giao Vận & Vận Đơn)**:
   - Tính phí ship thông minh: Miễn phí vận chuyển cho đơn từ 500,000đ; tính phí theo khu vực nội thành / ngoại thành và khối lượng gói hàng.
   - Tích hợp adapter GHN (Giao Hàng Nhanh) / GHTK, sinh mã vận đơn `GHN-VN-xxxxxx` và link in phiếu gửi.
   - Webhook nhận lộ trình từ bưu tá (`PICKED` -> `IN_TRANSIT` -> `OUT_FOR_DELIVERY` -> `DELIVERED`), tự động cập nhật đơn hàng thành công.

7. **Return & Refund (Đổi Trả & Hoàn Tiền)**:
   - Quy trình đổi trả thẩm định: Khách gửi yêu cầu kèm hình ảnh bằng chứng.
   - Admin duyệt (`APPROVED` / `REJECTED`).
   - Kho nhận hàng: Tự động nhập kho trở lại (Restock items) và kích hoạt lệnh hoàn tiền tự động qua PayPal Refund API hoặc chuyển khoản ngân hàng.

---

## 🛠️ 3. Công Nghệ Sử Dụng

- **Ngôn ngữ**: Python 3.14 / 3.12+
- **Framework**: FastAPI (Asynchronous, High Performance)
- **ORM & Database**: SQLAlchemy 2.0 (hỗ trợ SQLite mặc định và sẵn sàng PostgreSQL/MySQL)
- **Validation**: Pydantic v2 (Strict typing, DTO serialization)
- **Tài liệu API**: Swagger UI (OpenAPI 3.0) & ReDoc
- **Auth**: JWT (PyJWT), bcrypt (password hashing)
- **Testing**: Pytest & Pytest-Asyncio (18 test cases bao phủ toàn bộ luồng nghiệp vụ)
- **Frontend**: React 18 + TypeScript, Vite, TailwindCSS
- **Tiện ích**: QRCode, Pillow, Httpx, Python-dotenv

---

## 📦 4. Cấu Trúc Thư Mục Dự Án

```
moc-tram-ecommerce/
│
├── app/                              # ✅ Business API (FastAPI — đã hoàn thành)
│   ├── api/v1/
│   │   ├── orders.py                 # POST/GET /orders — Checkout & State Machine
│   │   ├── payments.py               # VietQR, PayPal, SePAY Webhook
│   │   ├── inventory.py              # Kiểm tra kho, giữ hàng, cleanup TTL
│   │   ├── coupons.py                # Validate & tạo mã giảm giá
│   │   ├── shipping.py               # Tính cước, tạo vận đơn, tracking webhook
│   │   ├── returns.py                # Đổi trả, duyệt, hoàn tiền
│   │   ├── products.py               # Danh sách & chi tiết sản phẩm
│   │   └── router.py                 # Tổng hợp Router v1
│   ├── core/
│   │   ├── database.py               # SQLAlchemy engine, SessionLocal, get_db
│   │   ├── exceptions.py             # Domain Custom Exceptions
│   │   ├── security.py               # Webhook HMAC & Admin API Key
│   │   └── scheduler.py              # Background Worker quét giữ kho hết hạn
│   ├── integrations/
│   │   ├── vietqr_client.py          # NAPAS 247 VietQR generator & SePAY parser
│   │   ├── paypal_client.py          # PayPal REST API v2 Checkout & Refund
│   │   └── shipping_client.py        # GHN / GHTK Carrier Adapter
│   ├── models/
│   │   ├── product.py                # Category, Product, ProductVariant
│   │   ├── order.py                  # Order, OrderItem, OrderStatusHistory, StockReservation
│   │   ├── payment.py                # PaymentTransaction
│   │   ├── coupon.py                 # Coupon, CouponUsage
│   │   ├── shipping.py               # ShippingOrder, ShippingTrackingHistory
│   │   └── return_refund.py          # ReturnRequest, ReturnItem, RefundRecord
│   ├── schemas/                      # Pydantic Request / Response DTOs
│   │   ├── order_dto.py
│   │   ├── payment_dto.py
│   │   ├── coupon_dto.py
│   │   ├── shipping_dto.py
│   │   ├── return_refund_dto.py
│   │   └── product_dto.py
│   ├── services/                     # Business Logic Services
│   │   ├── order_service.py
│   │   ├── inventory_service.py
│   │   ├── coupon_service.py
│   │   ├── payment_service.py
│   │   ├── shipping_service.py
│   │   └── return_refund_service.py
│   ├── seed/
│   │   └── seed_data.py              # Dữ liệu mẫu Trầm Hương & Thiền Định
│   ├── config.py                     # Pydantic BaseSettings (.env)
│   └── main.py                       # FastAPI App Entry + Lifespan
│
├── backend/                          # 🔄 Backend v2 — Auth & User (đang phát triển)
│   └── src/
│       ├── app.py                    # FastAPI instance + CORS middleware
│       ├── index.py                  # Mounting public & protected routers
│       ├── main.py                   # Entry point (uvicorn)
│       ├── configs/
│       │   └── db_connection.py      # Engine, SessionLocal, DeclarativeBase, get_db
│       ├── constants/
│       │   ├── messages.py           # COMMON_MESSAGES, AUTH_MESSAGES, USER_MESSAGES
│       │   ├── paths.py              # ENV_FILE path constant
│       │   ├── roles.py              # ROLES (StrEnum: customer, staff, warehouse_staff, admin)
│       │   └── user_statuses.py      # USER_STATUSES (StrEnum: active, inactive)
│       ├── middlewares/
│       │   ├── auth_dependency.py    # JWT Bearer token validation → request.state.user
│       │   ├── authorize_dependency.py # RBAC: authorize(*roles) dependency
│       │   └── error_dependency.py   # ApiError handler & Global exception handler
│       ├── modules/
│       │   ├── auth/                 # 🔐 Module xác thực
│       │   │   ├── auth_controller.py    # Request handlers (register, login, OTP...)
│       │   │   ├── auth_repository.py    # Truy vấn DB cho Auth (token, OTP)
│       │   │   ├── auth_routes.py        # Router: /register /login /logout /refresh-token
│       │   │   │                         #         /forgot-password /verify-otp
│       │   │   │                         #         /reset-password /change-password
│       │   │   ├── auth_service.py       # Business logic Auth
│       │   │   ├── auth_validator.py     # Pydantic: RegisterSchema, LoginSchema,
│       │   │   │                         #   RefreshTokenSchema, ForgotPasswordSchema,
│       │   │   │                         #   VerifyOtpSchema, ResetPasswordSchema,
│       │   │   │                         #   ChangePasswordSchema
│       │   │   ├── password_reset_otp.py # Model OTP đặt lại mật khẩu (expires_at, attempts)
│       │   │   └── refresh_token.py      # Model Refresh Token (user_id, token, expires_at)
│       │   └── user/                 # 👤 Module quản lý người dùng
│       │       ├── user.py               # Model User (id, email, password, phone, role, status)
│       │       ├── user_controller.py    # GET /me, PATCH /me
│       │       ├── user_repository.py    # CRUD: find_by_id/email/phone, create, update
│       │       ├── user_routes.py        # Router: GET /users/me, PATCH /users/me
│       │       ├── user_service.py       # Business logic: create, update_me, get_all (pagination)
│       │       └── user_validator.py     # Pydantic: UpdateMeSchema
│       └── utils/
│           ├── api_error.py          # ApiError exception class (status_code, message, error)
│           ├── api_response.py       # ApiResponse helper (success, error, created)
│           ├── email.py              # Gửi email OTP (BackgroundTasks)
│           ├── jwt.py                # create_access_token, create_refresh_token, verify_*
│           └── password.py           # hash_password, verify_password (bcrypt)
│
├── frontend/                         # 🎨 React + TypeScript Frontend
│   └── src/
│       ├── App.tsx                   # Tất cả Pages + React Router (1183 dòng)
│       ├── index.css                 # Global styles (TailwindCSS)
│       ├── main.tsx                  # ReactDOM entry point
│       ├── components/
│       │   ├── common/               # Header, Footer, Breadcrumb, Pagination,
│       │   │                         # ProtectedRoute, ScrollToTop, StatusBadge, EmptyState
│       │   └── product/              # ProductCard
│       ├── contexts/
│       │   ├── AuthContext.tsx       # Quản lý trạng thái đăng nhập (user, token)
│       │   └── CartContext.tsx       # Quản lý giỏ hàng (localStorage)
│       ├── services/                 # Mock API in-memory (chưa kết nối backend thực)
│       │   ├── authApi.ts            # Đăng ký, đăng nhập, OTP, logout, updateProfile
│       │   ├── orderApi.ts           # Tạo đơn, tra cứu, cập nhật trạng thái, đổi trả
│       │   ├── productApi.ts         # Danh sách, chi tiết, đánh giá sản phẩm
│       │   ├── cartApi.ts            # Tính tổng giỏ hàng, phí ship
│       │   ├── paymentApi.ts         # VietQR, PayPal mock
│       │   ├── consultationApi.ts    # Báo giá B2B, đặt lịch showroom
│       │   ├── inventoryApi.ts       # Kiểm tra tồn kho
│       │   └── miscApi.ts            # Coupon (validate, list), articles, user management
│       ├── constants/
│       │   ├── routes.ts             # ROUTES object (URL mapping tất cả trang)
│       │   ├── enums.ts              # ORDER_STATUS_LABELS, APP_CONFIG, SHOWROOMS...
│       │   └── permissions.ts        # Role permissions mapping
│       ├── types/
│       │   └── index.ts              # TypeScript interfaces (Product, Order, User, Coupon...)
│       ├── mock/
│       │   ├── products.ts           # 15 sản phẩm mẫu Trầm Hương & Thiền Định
│       │   ├── orders.ts             # Đơn hàng mẫu, coupon, bài viết
│       │   └── catalog.ts            # Danh mục, xuất xứ, loại & cấp trầm
│       └── utils/
│           ├── format.ts             # formatVND, formatDateTime
│           ├── validation.ts         # validateEmail, validatePhone
│           └── helpers.ts            # randomDelay, generateId, generateOrderCode
│
├── docs/
│   ├── ARCHITECTURE.md               # Tài liệu thiết kế hệ thống chi tiết
│   └── Postman_Collection.json       # Postman collection đầy đủ 7 module API
│
├── tests/                            # Pytest test suite (18 tests — 100% PASS)
│   ├── conftest.py                   # Fixtures: TestClient, in-memory SQLite, seed data
│   ├── test_coupons.py               # Validate coupon, giới hạn %, đơn tối thiểu (5 tests)
│   ├── test_inventory_reservation.py # Giữ kho, chống oversell, TTL cleanup (3 tests)
│   ├── test_order_flow.py            # Tạo đơn COD/VietQR/PayPal, State Machine (4 tests)
│   ├── test_payment_webhooks.py      # Webhook SePAY, idempotency, PayPal capture (3 tests)
│   └── test_shipping_and_returns.py  # Tính cước, vận đơn, webhook, đổi trả (3 tests)
│
├── .env                              # Biến môi trường (DB_URL, JWT_SECRET, PORT, PAYPAL...)
├── .env.example                      # Template .env mẫu
├── .gitignore
├── pytest.ini                        # Cấu hình Pytest (testpaths, asyncio mode AUTO)
├── requirements.txt                  # Python dependencies (cho app/)
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
.\venv\Scripts\python.exe -m pytest -v
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
