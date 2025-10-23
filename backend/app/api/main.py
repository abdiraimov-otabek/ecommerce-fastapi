from fastapi import APIRouter

from app.api.routes import category, items, login, private, product, users
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(category.router)
api_router.include_router(product.router)
api_router.include_router(items.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
