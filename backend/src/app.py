import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from index import index_router
from middlewares.error_dependency import (
    api_request_error_handler,
    global_exception_handler,
)
from utils.api_error import ApiError

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CLIENT_ORIGIN", "http://localhost:5173"),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:5181",
        "http://127.0.0.1:5181",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(index_router, prefix="/api/v1")

app.add_exception_handler(ApiError, api_request_error_handler)
app.add_exception_handler(Exception, global_exception_handler)
