import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.scheduler import stock_reservation_worker
from app.core.exceptions import BusinessRuleException
from app.api.v1.router import api_v1_router
from app.seed.seed_data import seed_database

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("zen_agarwood_oms")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Tạo database schema và seed dữ liệu nếu chưa có
    logger.info("Đang khởi tạo cơ sở dữ liệu và seed dữ liệu mẫu Trầm Hương & Thiền Định...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    # Khởi chạy Background Worker dọn dẹp các phiên giữ hàng hết hạn (TTL 15 phút)
    worker_task = asyncio.create_task(stock_reservation_worker())
    logger.info("Stock Reservation Worker đã được kích hoạt thành công.")

    yield

    # Shutdown
    worker_task.cancel()
    logger.info("Ứng dụng dừng hoạt động. Worker đã được hủy an toàn.")


app = FastAPI(
    title="Tĩnh Tâm Các - Hệ Thống Quản Lý Đơn Hàng Trầm Hương & Dụng Cụ Thiền Định (Zen Agarwood OMS)",
    description="""
### Backend API & Business Logic (Order Management System)
Chuyên biệt cho thương hiệu Trầm Hương Tự Nhiên & Dụng Cụ Thiền Định:
* **Order Management**: Máy trạng thái vòng đời đơn hàng, lịch sử audit log, checkout flow.
* **Inventory & Stock Reservation**: Giữ hàng 15 phút chống oversell (concurrency-safe), tự động trừ kho khi thanh toán, tự động nhả kho khi hủy/timeout.
* **Payment Multi-Gateway**:
  * **COD**: Thanh toán khi nhận hàng.
  * **VietQR / NAPAS 247**: Sinh mã QR ngân hàng động, webhook SePAY/Casso tự động duyệt đơn.
  * **PayPal v2**: Tích hợp thanh toán quốc tế cho kiều bào, sandbox capture & webhook.
* **Coupon & Discount Logic**: Chiết khấu theo %, số tiền cố định, miễn phí ship, giới hạn theo danh mục (vd: Chuông Xoay, Bồ Đoàn).
* **Shipping & Tracking**: Tích hợp GHN / GHTK, tính phí ship thông minh, sinh mã vận đơn (Waybill) và Webhook lộ trình.
* **Return & Refund**: Quy trình đổi trả thẩm định, hoàn nhập kho (Restock) và hoàn tiền đa kênh.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handler cho Domain Business Exceptions
@app.exception_handler(BusinessRuleException)
async def business_rule_exception_handler(request: Request, exc: BusinessRuleException):
    http_status = status.HTTP_404_NOT_FOUND if exc.code == "RESOURCE_NOT_FOUND" else status.HTTP_400_BAD_REQUEST
    return JSONResponse(
        status_code=http_status,
        content={
            "error": True,
            "code": exc.code,
            "message": exc.message,
            "details": exc.details
        }
    )


# Đăng ký Router v1
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root & Health Check"])
def root_endpoint():
    return {
        "project": settings.PROJECT_NAME,
        "brand": "Tĩnh Tâm Các - Trầm Hương Thiền An",
        "version": "1.0.0",
        "status": "Online & Healthy",
        "documentation": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["Root & Health Check"])
def health_check():
    return {"status": "ok", "timestamp": str(asyncio.get_event_loop().time())}
