import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from configs.db_connection import check_db_connection

if __name__ == "__main__":
    check_db_connection()
    uvicorn.run(
        "app:app",
        host="localhost",
        port=int(os.getenv("PORT")),
        reload=True,
    )