from fastapi import APIRouter
from app.api.v1.routes import admin

router = APIRouter(
    prefix="/api/v1"
)

router.include_router(admin.router, prefix="/admin", tags=["Diagnostics"])
