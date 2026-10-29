from enum import StrEnum


class PAYMENT_METHODS(StrEnum):
    VIETQR = "VIETQR"


class PAYMENT_STATUSES(StrEnum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"
