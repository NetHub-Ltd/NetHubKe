from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool
from sqlmodel import SQLModel
# import models to ensure they are registered with SQLModel.metadata

# from app.lib.db.models import User, BlogPost, Service, Order, Authors, MpesaTransaction  # noqa: F401
from app.db.models.user import User # noqa: F401

# explicitly import metadata

from app.core.config import settings

# ---------------------------------------------------------
# Alembic Config
# ---------------------------------------------------------
config = context.config

# Setup logging
if config.config_file_name:
    fileConfig(config.config_file_name)

# Metadata for autogenerate
target_metadata = SQLModel.metadata


# ---------------------------------------------------------
# Offline migrations
# ---------------------------------------------------------
def run_migrations_offline() -> None:
    """
    Run migrations without DB connection.
    Emits raw SQL.
    """
    context.configure(
        url=settings.sync_db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------
# Online migrations
# ---------------------------------------------------------
def run_migrations_online() -> None:
    """
    Run migrations with a live DB connection.
    Connections are NOT pooled and are closed immediately.
    """

    engine = create_engine(
        settings.sync_db_url,
        poolclass=pool.NullPool,  # 👈 ensures no idle connections
        future=True,
    )

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()

    # Explicit dispose for extra safety
    engine.dispose()


# ---------------------------------------------------------
# Entry point
# ---------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
