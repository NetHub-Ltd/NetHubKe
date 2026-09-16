from fastapi import APIRouter
from app.api.v1.routes import admin, users, services, auth

router = APIRouter(
    prefix="/api/v1"
)

# router.include_router(admin.router, prefix="/admin", tags=["Diagnostics"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(services.router, prefix="/services", tags=["Services"])