
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect

backend_dir = Path(__file__).resolve().parent
src_dir = backend_dir / "src"

sys.path.insert(0, str(src_dir))
load_dotenv(backend_dir / ".env")

from configs.db_connection import Base, engine
from modules.auth.password_reset_otp import PasswordResetOtp

table_name = PasswordResetOtp.__tablename__

try:
    inspector = inspect(engine)

    if inspector.has_table(table_name):
        print(f"Bang {table_name} da ton tai, khong thay doi.")
    else:
        PasswordResetOtp.__table__.create(bind=engine)
        print(f"Da tao bang {table_name} thanh cong.")

    print("Cac bang OTP hien co:", inspect(engine).get_table_names())

except Exception as exc:
    print("Khong the tao bang OTP:")
    print(type(exc).__name__, str(exc))
    raise
