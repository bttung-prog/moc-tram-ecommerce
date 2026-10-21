from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Hệ Thống Quản Lý Đơn Hàng Trầm Hương & Dụng Cụ Thiền Định"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    SECRET_KEY: str = "zen_agarwood_secret_key"
    
    # Database
    DATABASE_URL: str = "sqlite:///./zen_agarwood_oms.db"

    # Inventory & Reservation
    STOCK_RESERVATION_TTL_MINUTES: int = 15
    STOCK_RESERVATION_CLEANUP_INTERVAL_SECONDS: int = 60

    # VietQR (NAPAS 247)
    VIETQR_BANK_ID: str = "MB"
    VIETQR_ACCOUNT_NO: str = "0399888999"
    VIETQR_ACCOUNT_NAME: str = "CTY TRAM HUONG THIEN AN"
    VIETQR_TEMPLATE: str = "compact2"
    SEPAY_WEBHOOK_API_KEY: str = "sepay_secret_token_zen_agarwood_2026"

    # PayPal v2
    PAYPAL_CLIENT_ID: str = "sb-client-id-zen-agarwood-sandbox"
    PAYPAL_CLIENT_SECRET: str = "sb-client-secret-zen-agarwood-sandbox"
    PAYPAL_MODE: str = "sandbox"
    PAYPAL_EXCHANGE_RATE_VND_USD: float = 25400.0
    PAYPAL_MOCK_MODE: bool = True

    # Shipping (GHN / GHTK)
    GHN_API_TOKEN: str = "ghn_api_token_sandbox_zen"
    GHN_SHOP_ID: int = 192837
    GHN_WEBHOOK_SECRET: str = "ghn_webhook_signature_zen_2026"
    SHIPPING_MOCK_MODE: bool = True

    # Admin Auth
    ADMIN_API_KEY: str = "zen_agarwood_admin_api_key_2026"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
