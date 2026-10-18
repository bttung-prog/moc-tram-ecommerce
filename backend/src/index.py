from fastapi import APIRouter, Depends

from middlewares.auth_dependency import auth_dependency

index_router = APIRouter()

public_router = APIRouter()

protected_router = APIRouter(dependencies=[Depends(auth_dependency)])

# mount api here

index_router.include_router(public_router)
index_router.include_router(protected_router)
