from typing import Type

from app.crud.base import BaseCRUD
from app.db.models.models import Tenant
from app.db.schemas.schemas import TenantCreate, TenantUpdate


class TenantCRUD(BaseCRUD[Tenant, TenantCreate, TenantUpdate]):
    def __init__(self, model: Type[Tenant]):
        super().__init__(model)


tenant_crud = TenantCRUD(Tenant)
