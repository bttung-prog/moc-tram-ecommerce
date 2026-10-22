from enum import Enum


class ROLES(str, Enum):
    CUSTOMER = "customer"
    WAREHOUSE_STAFF = "warehouse_staff"
    STAFF = "staff"
    ADMIN = "admin"
