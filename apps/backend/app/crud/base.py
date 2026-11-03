
from typing import Generic, Type, TypeVar, Optional, Sequence, Any, Dict, List
from uuid import UUID
from pydantic import BaseModel, ValidationError, TypeAdapter
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import SQLModel, select, col, func
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status
from loguru import logger

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseCRUD(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: UUID) -> Optional[ModelType]:
        # result.first() is fine, but scalar_one_or_none() is more explicit for UUID lookups
        stmt = select(self.model).where(self.model.id == id)
        result = await db.exec(stmt)
        return result.first()

    async def get_multi(
                    self,
                    db: AsyncSession,
                    *,
                    skip: int = 0,
                    limit: int = 100,
                ) -> Sequence[ModelType]:
                    stmt = select(self.model).offset(skip).limit(limit)
                    result = await db.exec(stmt)
                    return result.all()

    async def get_by_attributes(
            self,
            db: AsyncSession,
            *,
            filters: Dict[str, Any],
            skip: int = 0,
            limit: int = 100,
            descending: bool = False,
    ) -> Sequence[ModelType]:
        stmt = select(self.model)

        for field_name, value in filters.items():
            if not hasattr(self.model, field_name):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Field '{field_name}' invalid for {self.model.__name__}",
                )

            # Type validation: Optimized check
            field_info = self.model.model_fields.get(field_name)
            if field_info and value is not None:
                try:
                    TypeAdapter(field_info.annotation).validate_python(value)
                except ValidationError:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Value '{value}' is invalid for {field_name}",
                    )

            stmt = stmt.where(getattr(self.model, field_name) == value)

        if descending:
            # col() is good practice for SQLModel column referencing
            stmt = stmt.order_by(col(self.model.id).desc())
        else:
            stmt = stmt.order_by(col(self.model.id).asc())

        result = await db.exec(stmt.offset(skip).limit(limit))
        return result.all()

    async def create(
            self, db: AsyncSession, *, obj_in: CreateSchemaType
    ) -> ModelType:
        db_obj = self.model.model_validate(obj_in)  # SQLModel preferred way
        try:
            db.add(db_obj)
            await db.flush()
            await db.refresh(db_obj)
            return db_obj
        except IntegrityError as e:
            await db.rollback()
            logger.error("Integrity Error during create: {}", str(e))
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Resource already exists or constraint violation."
            )
        except SQLAlchemyError as e:
            await db.rollback()
            logger.error("Database Error: {}", str(e))
            raise HTTPException(status_code=500, detail="Database transaction failed")

    async def update(
            self, db: AsyncSession, *, db_obj: ModelType, obj_in: UpdateSchemaType | Dict[str, Any]
    ) -> ModelType:
        # Handle both Pydantic model or a plain dictionary
        update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        db.add(db_obj)
        try:
            await db.flush()
            await db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            await db.rollback()
            logger.error("Update failed: {}", str(e))
            raise HTTPException(status_code=500, detail="Update failed")

    async def remove(self, db: AsyncSession, *, id: UUID) -> Optional[ModelType]:
        obj = await self.get(db, id)
        if obj:
            try:
                await db.delete(obj)
                await db.flush()
            except SQLAlchemyError as e:
                await db.rollback()
                logger.error("Delete failed: {}", str(e))
                raise HTTPException(status_code=500, detail="Deletion failed")
        return obj