import os

import uvicorn
from dotenv import load_dotenv

from constants.paths import ENV_FILE

load_dotenv(ENV_FILE)

from configs.db_connection import check_db_connection  # noqa: E402, I001


def start_server():
    check_db_connection()
    uvicorn.run(
        "app:app",
        host="localhost",
        port=int(os.getenv("PORT")),
        reload=True,
    )


if __name__ == "__main__":
    start_server()
