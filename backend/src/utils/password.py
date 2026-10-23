import os

import bcrypt

SALT_ROUNDS = int(os.getenv("BCRYPT_SALT_ROUNDS"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(SALT_ROUNDS)).decode(
        "utf-8"
    )


def compare_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
