import base64
import io
import urllib.parse
import qrcode
from typing import Dict, Any, Optional
from app.config import settings


class VietQRClient:
    """
    Client tích hợp chuẩn VietQR (NAPAS 247) cho phép thanh toán tức thì
    qua ứng dụng mọi ngân hàng tại Việt Nam và ví điện tử.
    """

    def __init__(
        self,
        bank_id: str = settings.VIETQR_BANK_ID,
        account_no: str = settings.VIETQR_ACCOUNT_NO,
        account_name: str = settings.VIETQR_ACCOUNT_NAME,
        template: str = settings.VIETQR_TEMPLATE
    ):
        self.bank_id = bank_id
        self.account_no = account_no
        self.account_name = account_name
        self.template = template

    def generate_qr_payload(self, order_code: str, amount: float) -> Dict[str, Any]:
        """
        Sinh thông tin VietQR đầy đủ gồm:
        - Chuỗi cú pháp NAPAS 247
        - Link ảnh VietQR trực tiếp từ cổng VietQR.io
        - Ảnh Base64 PNG render offline bằng qrcode library
        """
        # Nội dung chuyển khoản duy nhất theo mã đơn hàng
        transfer_content = f"{order_code}".replace("-", "").upper()
        amount_int = int(round(amount))
        
        # Link VietQR Quick Link
        encoded_acc_name = urllib.parse.quote(self.account_name)
        encoded_content = urllib.parse.quote(transfer_content)
        vietqr_image_url = (
            f"https://img.vietqr.io/image/{self.bank_id}-{self.account_no}-{self.template}.png"
            f"?amount={amount_int}&addInfo={encoded_content}&accountName={encoded_acc_name}"
        )

        # Chuỗi định dạng chuẩn EMVCo / Napas247 payload text
        qr_data_string = (
            f"00020101021238540010A000000727012400069704220110{self.account_no}0208QRIBFTTA"
            f"5303704540{len(str(amount_int)):02d}{amount_int}5802VN62"
            f"{len(transfer_content) + 4:02d}080{len(transfer_content):02d}{transfer_content}6304"
        )

        # Tạo ảnh Base64 offline độc lập
        qr_base64 = self._generate_base64_qr(vietqr_image_url)

        return {
            "bank_id": self.bank_id,
            "bank_name": "Ngân hàng TMCP Quân Đội (MB Bank)",
            "account_no": self.account_no,
            "account_name": self.account_name,
            "amount": float(amount_int),
            "transfer_content": transfer_content,
            "qr_data_string": qr_data_string,
            "qr_image_url": vietqr_image_url,
            "qr_base64": qr_base64
        }

    def _generate_base64_qr(self, data: str) -> str:
        """Render mã QR thành chuỗi Base64 Data URL."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=8,
            border=2,
        )
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#2c1810", back_color="#faf7f2")  # Màu nâu trầm hương & giấy thiền
        
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{img_str}"

    def parse_order_code_from_content(self, content: str) -> Optional[str]:
        """
        Trích xuất mã đơn hàng từ nội dung chuyển khoản ngân hàng.
        Ví dụ: 'MB-123 thanh toan DH202610210001 cua KH An' -> 'DH202610210001'
        """
        import re
        match = re.search(r"(DH[A-Za-z0-9]+)", content, re.IGNORECASE)
        if match:
            return match.group(1).upper()
        return None


vietqr_client = VietQRClient()
