
from fastapi import APIRouter, Depends

from middlewares.auth_dependency import auth_dependency
from modules.auth.auth_routes import auth_router
from modules.user.user_routes import user_router
from modules.order.order_routes import order_router, admin_order_router

index_router = APIRouter()

public_router = APIRouter()
public_router.include_router(auth_router, prefix="/auth")

protected_router = APIRouter(
    dependencies=[Depends(auth_dependency)]
)

protected_router.include_router(user_router, prefix="/users")

# Khách hàng tạo đơn: POST /api/v1/orders
protected_router.include_router(order_router)

# Quản trị xem đơn: GET /api/v1/admin/orders
protected_router.include_router(admin_order_router, prefix="/admin")

index_router.include_router(public_router)
index_router.include_router(protected_router)

