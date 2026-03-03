from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4


from sqlalchemy import DateTime, func, text, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlmodel import Field, SQLModel, Column, Relationship, Index

EffectiveJSON = JSON().with_variant(JSONB, "postgresql")

class BaseMixin(SQLModel):
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        sa_type=PG_UUID(as_uuid=True),
        sa_column_kwargs={
            # We use a lambda for server_default to handle Postgres specifically
            # without breaking the SQLite compiler during metadata creation.
            "server_default": text("gen_random_uuid()")
            if "postgresql" in str(EffectiveJSON)
            else None,
            "nullable": False,
        },
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"server_default": func.now(), "nullable": False},
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={
            "server_default": func.now(),
            "onupdate": func.now(),
            "nullable": False,
        },
    )
    deleted_at: Optional[datetime] = Field(
        default=None,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"nullable": True},
    )