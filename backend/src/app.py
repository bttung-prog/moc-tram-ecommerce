import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from index import index_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_ORIGIN")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(index_router, prefix="/api/v1")
