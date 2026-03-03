from fastapi import APIRouter, Depends

from app.core.security import get_keycloak_diagnostics

# from app.core.security import get_current_user

router = APIRouter()


@router.get("/show-config")
async def show_config():
    # You may restrict to admin later
    return await get_keycloak_diagnostics()