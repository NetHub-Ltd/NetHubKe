"""API v1 router."""
from fastapi import APIRouter

from app.api.v1.routes import admin, applications, services, users

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(users.router)
api_router.include_router(services.router)
api_router.include_router(applications.router)
api_router.include_router(admin.router)
