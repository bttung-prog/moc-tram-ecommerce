import os

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
    allow_origins=[os.getenv("CLIENT_ORIGIN")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(index_router, prefix="/api/v1")

app.add_exception_handler(ApiError, api_request_error_handler)
app.add_exception_handler(Exception, global_exception_handler)
