from fastapi import APIRouter
from app.api.v1.orders import router as orders_router
from app.api.v1.payments import router as payments_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.coupons import router as coupons_router
from app.api.v1.shipping import router as shipping_router
from app.api.v1.returns import router as returns_router
from app.api.v1.products import router as products_router

api_v1_router = APIRouter()

api_v1_router.include_router(orders_router)
api_v1_router.include_router(payments_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(coupons_router)
api_v1_router.include_router(shipping_router)
api_v1_router.include_router(returns_router)
api_v1_router.include_router(products_router)
