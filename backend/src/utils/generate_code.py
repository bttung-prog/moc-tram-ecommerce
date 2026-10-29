from nanoid import generate

NUMERIC = "0123456789"


def generate_numeric_code(prefix: str | None = None, size: int = 6) -> str:
    digits = generate(NUMERIC, size)
    if prefix:
        return f"{prefix}-{digits}"
    return digits


def generate_staff_code(prefix: str = "STF", size: int = 6) -> str:
    return f"{prefix}-{generate(NUMERIC, size)}"


def generate_warehouse_staff_code(prefix: str = "WHS", size: int = 6) -> str:
    return f"{prefix}-{generate(NUMERIC, size)}"


def generate_order_code(prefix: str = "ORD", size: int = 8) -> str:
    return f"{prefix}-{generate(NUMERIC, size)}"
