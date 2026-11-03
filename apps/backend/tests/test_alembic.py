"""CI gate: Alembic upgrade head applies cleanly on Postgres."""
from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text

from app.core.config import settings


def test_alembic_upgrade_head():
    root = Path(__file__).resolve().parents[1]
    cfg = Config(str(root / "alembic.ini"))
    cfg.set_main_option("script_location", str(root / "alembic"))
    cfg.set_main_option("sqlalchemy.url", settings.sync_database_uri)

    # Drop public schema objects so upgrade runs from empty
    engine = create_engine(settings.sync_database_uri)
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))
    engine.dispose()

    command.upgrade(cfg, "head")

    engine = create_engine(settings.sync_database_uri)
    with engine.connect() as conn:
        tables = {
            r[0]
            for r in conn.execute(
                text(
                    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
                )
            )
        }
    engine.dispose()
    assert "users" in tables
    assert "user_identities" in tables
    assert "tenants" in tables
    assert "alembic_version" in tables
