import os
import sys

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import uvicorn
from dotenv import load_dotenv

from constants.paths import ENV_FILE

load_dotenv(ENV_FILE)

from configs.db_connection import Base, check_db_connection, engine  # noqa: E402, I001


def init_db():
    check_db_connection()
    # Import all models to register with Base metadata
    import modules.address.address  # noqa: F401
    import modules.auth.password_reset_otp  # noqa: F401
    import modules.auth.refresh_token  # noqa: F401
    import modules.auth.register_otp  # noqa: F401
    import modules.cart.cart  # noqa: F401
    import modules.cart.cart_item  # noqa: F401
    import modules.category.category  # noqa: F401
    import modules.coupon.coupon  # noqa: F401
    import modules.coupon.coupon_usage  # noqa: F401
    import modules.customer.customer  # noqa: F401
    import modules.feedback.feedback  # noqa: F401
    import modules.inventory.inventory  # noqa: F401
    import modules.issue.issue  # noqa: F401
    import modules.order.order  # noqa: F401
    import modules.payment.payment  # noqa: F401
    import modules.product.product  # noqa: F401
    import modules.receipt.receipt  # noqa: F401
    import modules.staff.staff  # noqa: F401
    import modules.user.user  # noqa: F401
    import modules.warehouse.warehouse  # noqa: F401
    import modules.warehouse_staff.warehouse_staff  # noqa: F401

    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")


def start_server():
    init_db()
    uvicorn.run(
        "app:app",
        host="localhost",
        port=int(os.getenv("PORT")),
        reload=True,
    )


if __name__ == "__main__":
    start_server()
