import asyncio
import logging
from app.config import settings
from app.core.database import SessionLocal
from app.services.inventory_service import inventory_service

logger = logging.getLogger("zen_agarwood_oms.scheduler")


async def stock_reservation_worker():
    """
    Background worker định kỳ quét và giải phóng các phiên giữ hàng quá hạn (TTL 15 phút).
    Tự động nhả tồn kho và chuyển trạng thái đơn hàng sang CANCELLED (Timeout).
    """
    logger.info("Khởi động Stock Reservation Cleanup Worker...")
    while True:
        try:
            db = SessionLocal()
            try:
                released_count = inventory_service.cleanup_expired_reservations(db)
                if released_count > 0:
                    logger.info(f"[StockWorker] Đã giải phóng giữ kho cho {released_count} đơn hàng quá hạn thanh toán.")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"[StockWorker] Lỗi trong tiến trình quét tồn kho hết hạn: {str(e)}")

        await asyncio.sleep(settings.STOCK_RESERVATION_CLEANUP_INTERVAL_SECONDS)
