from typing import Type

from app.crud.base import BaseCRUD
from app.db.schemas.user import TenantCreate, TenantUpdate
from app.db.models.user import Tenant

class UserCRUD(BaseCRUD[Tenant, TenantCreate, TenantUpdate]):
    def __init__(self, model: Type[Tenant]):
        super().__init__(model)


tenant_crud = UserCRUD(Tenant)