from nanoid import generate

numeric = "0123456789"


def generate_order_code(prefix="MT", size=8):
    return prefix + "-" + generate(numeric, size)
