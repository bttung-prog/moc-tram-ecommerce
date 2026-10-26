from fastapi import APIRouter, Depends

from middlewares.auth_dependency import auth_dependency
from modules.auth.auth_routes import auth_router
from modules.user.user_routes import user_router

index_router = APIRouter()

public_router = APIRouter()

protected_router = APIRouter(dependencies=[Depends(auth_dependency)])

# mount api here
public_router.include_router(auth_router, prefix="/auth")
protected_router.include_router(user_router, prefix="/users")

index_router.include_router(public_router)
index_router.include_router(protected_router)
