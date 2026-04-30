from fastapi import APIRouter
from app.api.v1.routes import admin, users, services

router = APIRouter(
    prefix="/api/v1"
)

# router.include_router(admin.router, prefix="/admin", tags=["Diagnostics"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(services.router, prefix="/services", tags=["Services"])