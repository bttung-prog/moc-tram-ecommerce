import uuid
from typing import Dict, Any, Optional
import httpx
from app.config import settings
from app.core.exceptions import PaymentProcessingException


class PayPalClient:
    """
    Tích hợp cổng thanh toán PayPal REST API v2
    Dành cho khách hàng quốc tế hoặc kiều bào đặt mua Trầm Hương & Dụng Cụ Thiền Định.
    """

    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.mode = settings.PAYPAL_MODE
        self.exchange_rate = settings.PAYPAL_EXCHANGE_RATE_VND_USD
        self.mock_mode = settings.PAYPAL_MOCK_MODE

        self.base_url = (
            "https://api-m.sandbox.paypal.com"
            if self.mode == "sandbox"
            else "https://api-m.paypal.com"
        )

    def vnd_to_usd(self, amount_vnd: float) -> float:
        """Quy đổi tiền Việt (VND) sang Đô la Mỹ (USD)."""
        return round(amount_vnd / self.exchange_rate, 2)

    async def get_access_token(self) -> str:
        """Lấy OAuth2 Bearer token từ PayPal API."""
        if self.mock_mode:
            return "mock_paypal_access_token_zen_agarwood"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/v1/oauth2/token",
                    auth=(self.client_id, self.client_secret),
                    data={"grant_type": "client_credentials"},
                    headers={"Accept": "application/json"}
                )
                if response.status_code != 200:
                    raise PaymentProcessingException("Không thể xác thực với PayPal OAuth2", gateway="PAYPAL")
                return response.json().get("access_token")
            except Exception as e:
                raise PaymentProcessingException(f"Lỗi kết nối PayPal API: {str(e)}", gateway="PAYPAL")

    async def create_order(self, order_code: str, amount_vnd: float) -> Dict[str, Any]:
        """Tạo đơn hàng thanh toán trên PayPal."""
        amount_usd = self.vnd_to_usd(amount_vnd)

        if self.mock_mode:
            paypal_order_id = f"PAYPAL-ORD-{uuid.uuid4().hex[:12].upper()}"
            approve_url = f"https://www.sandbox.paypal.com/checkoutnow?token={paypal_order_id}"
            return {
                "paypal_order_id": paypal_order_id,
                "approve_url": approve_url,
                "amount_usd": amount_usd,
                "exchange_rate": self.exchange_rate,
                "status": "CREATED",
                "raw_response": {"id": paypal_order_id, "status": "CREATED"}
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": order_code,
                    "description": f"Đơn hàng Trầm Hương & Dụng Cụ Thiền Định - {order_code}",
                    "amount": {
                        "currency_code": "USD",
                        "value": f"{amount_usd:.2f}"
                    }
                }
            ],
            "application_context": {
                "brand_name": "Tĩnh Tâm Các - Trầm Hương Thiền An",
                "landing_page": "BILLING",
                "user_action": "PAY_NOW",
                "return_url": "https://zenagarwood.vn/checkout/success",
                "cancel_url": "https://zenagarwood.vn/checkout/cancel"
            }
        }

        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/v2/checkout/orders", json=payload, headers=headers)
            if res.status_code not in (200, 201):
                raise PaymentProcessingException(f"Tạo đơn PayPal thất bại: {res.text}", gateway="PAYPAL")
            
            data = res.json()
            paypal_order_id = data.get("id")
            approve_url = next((link["href"] for link in data.get("links", []) if link["rel"] == "approve"), None)
            
            return {
                "paypal_order_id": paypal_order_id,
                "approve_url": approve_url,
                "amount_usd": amount_usd,
                "exchange_rate": self.exchange_rate,
                "status": data.get("status", "CREATED"),
                "raw_response": data
            }

    async def capture_order(self, paypal_order_id: str) -> Dict[str, Any]:
        """Capture (thực thu) tiền đơn hàng sau khi khách approve."""
        if self.mock_mode:
            capture_id = f"CAPTURE-{uuid.uuid4().hex[:12].upper()}"
            return {
                "status": "COMPLETED",
                "capture_id": capture_id,
                "raw_response": {"id": capture_id, "status": "COMPLETED"}
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/v2/checkout/orders/{paypal_order_id}/capture", headers=headers)
            if res.status_code not in (200, 201):
                raise PaymentProcessingException(f"Capture PayPal thất bại: {res.text}", gateway="PAYPAL")
            
            data = res.json()
            captures = data.get("purchase_units", [{}])[0].get("payments", {}).get("captures", [])
            capture_id = captures[0].get("id") if captures else paypal_order_id
            
            return {
                "status": data.get("status", "COMPLETED"),
                "capture_id": capture_id,
                "raw_response": data
            }

    async def refund_capture(self, capture_id: str, amount_usd: float, note: str = "") -> Dict[str, Any]:
        """Hoàn tiền cho khách hàng qua PayPal."""
        if self.mock_mode:
            refund_id = f"REFUND-PP-{uuid.uuid4().hex[:10].upper()}"
            return {
                "status": "COMPLETED",
                "refund_id": refund_id,
                "raw_response": {"id": refund_id, "status": "COMPLETED"}
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "amount": {
                "value": f"{amount_usd:.2f}",
                "currency_code": "USD"
            },
            "note_to_payer": note or "Hoàn tiền đơn hàng Trầm Hương & Thiền Định"
        }
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/v2/payments/captures/{capture_id}/refund", json=payload, headers=headers)
            if res.status_code not in (200, 201):
                raise PaymentProcessingException(f"Hoàn tiền PayPal thất bại: {res.text}", gateway="PAYPAL")
            data = res.json()
            return {
                "status": data.get("status", "COMPLETED"),
                "refund_id": data.get("id"),
                "raw_response": data
            }


paypal_client = PayPalClient()
