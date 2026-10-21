import hmac
import hashlib
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.config import settings

api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)


def verify_admin_api_key(api_key: str = Security(api_key_header)) -> bool:
    """Verifies internal admin operations (restock, carrier config, manual order overrides)."""
    if not api_key or api_key != settings.ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key không hợp lệ hoặc thiếu quyền quản trị (Admin access required)."
        )
    return True


def verify_webhook_token(provided_token: str, expected_token: str) -> bool:
    """Constant-time string comparison for webhook authentication tokens."""
    if not provided_token or not expected_token:
        return False
    return hmac.compare_digest(provided_token, expected_token)


def verify_hmac_sha256(payload_bytes: bytes, signature: str, secret: str) -> bool:
    """Verify HMAC-SHA256 signature commonly used by payment & shipping webhooks."""
    expected = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
