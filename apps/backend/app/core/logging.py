"""Human-friendly logging with Loguru (INFO / WARNING / ERROR)."""
from __future__ import annotations

import logging
import sys

from loguru import logger

# Paths we do not want to spam at INFO (health checks, docs, etc.)
QUIET_PATH_PREFIXES = (
    "/health",
    "/ready",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/favicon.ico",
)


def is_quiet_path(path: str) -> bool:
    return any(path == p or path.startswith(p + "/") for p in QUIET_PATH_PREFIXES)


class InterceptHandler(logging.Handler):
    """Route stdlib logging into Loguru (single sink, no duplicate formats)."""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = str(record.levelno)

        # Drop uvicorn access lines — our middleware owns request logs
        if record.name == "uvicorn.access":
            return

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back  # type: ignore[assignment]
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging(level: str = "INFO") -> None:
    logger.remove()

    # One clean line: time | LEVEL | short location | message
    logger.add(
        sys.stderr,
        level=level.upper(),
        format=(
            "<green>{time:HH:mm:ss.SSS}</green> "
            "<level>{level: <7}</level> "
            "<cyan>{extra[component]}</cyan> "
            "<level>{message}</level>"
        ),
        filter=lambda record: record["extra"].setdefault("component", _component(record)) or True,
        enqueue=True,
        backtrace=False,
        diagnose=False,
        colorize=True,
    )

    logging.root.handlers = [InterceptHandler()]
    logging.root.setLevel(level.upper())

    for name in (
        "uvicorn",
        "uvicorn.error",
        "uvicorn.access",
        "fastapi",
        "sqlalchemy.engine",
        "httpx",
        "httpcore",
    ):
        log = logging.getLogger(name)
        log.handlers = [InterceptHandler()]
        log.propagate = False
        # Silence access logger entirely
        if name == "uvicorn.access":
            log.setLevel(logging.WARNING)

    logger.bind(component="boot").info("Logging ready (level={})", level.upper())


def _component(record: dict) -> str:  # noqa: ANN001
    name = record["name"] or ""
    if name.startswith("app."):
        parts = name.split(".")
        return parts[-1] if parts else "app"
    if name.startswith("uvicorn"):
        return "server"
    if name.startswith("sqlalchemy"):
        return "db"
    return name.split(".")[-1] if name else "app"


def get_logger(component: str = "app"):
    return logger.bind(component=component)
