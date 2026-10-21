from typing import Optional, Any, Dict


class BusinessRuleException(Exception):
    """Base domain exception for business rule violations."""
    def __init__(self, message: str, code: str = "BUSINESS_RULE_VIOLATION", details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}


class ResourceNotFoundException(BusinessRuleException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            message=f"Không tìm thấy {resource} với mã '{identifier}'",
            code="RESOURCE_NOT_FOUND",
            details={"resource": resource, "identifier": identifier}
        )


class InsufficientStockException(BusinessRuleException):
    def __init__(self, product_name: str, sku: str, requested: int, available: int):
        super().__init__(
            message=f"Sản phẩm '{product_name}' (SKU: {sku}) không đủ tồn kho. Yêu cầu: {requested}, Khả dụng: {available}",
            code="INSUFFICIENT_STOCK",
            details={"sku": sku, "requested": requested, "available": available}
        )


class ReservationExpiredException(BusinessRuleException):
    def __init__(self, reservation_id: str):
        super().__init__(
            message=f"Phiên giữ hàng (Reservation {reservation_id}) đã hết hạn hoặc bị hủy.",
            code="RESERVATION_EXPIRED",
            details={"reservation_id": reservation_id}
        )


class InvalidCouponException(BusinessRuleException):
    def __init__(self, reason: str, coupon_code: str):
        super().__init__(
            message=f"Mã giảm giá '{coupon_code}' không hợp lệ: {reason}",
            code="INVALID_COUPON",
            details={"coupon_code": coupon_code, "reason": reason}
        )


class InvalidOrderStateTransitionException(BusinessRuleException):
    def __init__(self, current_status: str, target_status: str):
        super().__init__(
            message=f"Không thể chuyển trạng thái đơn hàng từ '{current_status}' sang '{target_status}'.",
            code="INVALID_STATUS_TRANSITION",
            details={"current_status": current_status, "target_status": target_status}
        )


class PaymentProcessingException(BusinessRuleException):
    def __init__(self, message: str, gateway: str, raw_response: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=f"Lỗi cổng thanh toán [{gateway}]: {message}",
            code="PAYMENT_ERROR",
            details={"gateway": gateway, "raw_response": raw_response}
        )


class ShippingException(BusinessRuleException):
    def __init__(self, message: str, carrier: str = "GHN"):
        super().__init__(
            message=f"Lỗi giao vận [{carrier}]: {message}",
            code="SHIPPING_ERROR",
            details={"carrier": carrier}
        )
