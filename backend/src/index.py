from fastapi import APIRouter, Depends

from middlewares.auth_dependency import auth_dependency
from modules.auth.auth_routes import auth_router
from modules.category.category_routes import category_router
from modules.coupon.coupon_routes import coupon_router
from modules.product.product_routes import product_router
from modules.user.user_routes import user_router

index_router = APIRouter()

public_router = APIRouter()

protected_router = APIRouter(dependencies=[Depends(auth_dependency)])

# mount api here
public_router.include_router(auth_router, prefix="/auth")
public_router.include_router(category_router, prefix="/categories")
public_router.include_router(product_router, prefix="/products")
protected_router.include_router(user_router, prefix="/users")
protected_router.include_router(coupon_router, prefix="/coupons")

index_router.include_router(public_router)
index_router.include_router(protected_router)
