from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.models.models import Service
from app.db.schemas.schemas import ServiceCreateIn, ServiceUpdateIn
from app.crud.base import BaseCRUD

class ServiceCRUD(BaseCRUD[Service, ServiceCreateIn, ServiceUpdateIn]):
    def __init__(self, model: Service):
        super().__init__(model)

    async def get_service_by_slug(self, slug: str, db: AsyncSession):
        statement = select(self.model).where(self.model.slug == slug)
        result = await db.exec(statement)
        return result.first()


service_crud = ServiceCRUD(Service)