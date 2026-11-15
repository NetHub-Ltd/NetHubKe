"""API v1 router."""
from fastapi import APIRouter

from app.api.v1.routes import (
    admin,
    applications,
    organizations,
    plans,
    services,
    subscriptions,
    users,
    webhooks,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(users.router)
api_router.include_router(organizations.router)
api_router.include_router(subscriptions.router)
api_router.include_router(plans.router)
api_router.include_router(services.router)
api_router.include_router(applications.router)
api_router.include_router(admin.router)
api_router.include_router(webhooks.router)
