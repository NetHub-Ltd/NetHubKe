# import logging
# import sys
# from loguru import logger as log
#
#
# class InterceptHandler(logging.Handler):
#     """
#     Standard logging handler to intercept and redirect
#     standard logging calls to Loguru.
#     """
#
#     def emit(self, record):
#         # Get corresponding Loguru level if it exists
#         try:
#             level = log.level(record.levelname).name
#         except ValueError:
#             level = record.levelno
#
#         # Find caller from where originated the logged message
#         frame, depth = logging.currentframe(), 2
#         while frame.f_code.co_filename == logging.__file__:
#             frame = frame.f_back
#             depth += 1
#
#         log.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())
#
#
# def setup_logger():
#     # 1. Clear Loguru's default handler and standard logging handlers
#     log.remove()
#     logging.getLogger().handlers = [InterceptHandler()]
#
#     # 2. Block/Silence noisy 3rd party loggers
#     # We set them to WARNING to ignore the "INFO: Connected to DB" chatter
#     logging.getLogger("uvicorn").handlers = []
#     logging.getLogger("uvicorn.access").handlers = []
#     logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
#     logging.getLogger("aiosqlite").setLevel(logging.WARNING)
#
#     # 3. Add Loguru File Sink
#     log.add(
#         "app/logs/app.log",
#         rotation="10 MB",
#         retention="7 days",
#         compression="zip",
#         format="{time:YYYY-MM-DD HH:mm:ss} | <level>{level: <8}</level> | {message}",
#         level="DEBUG",
#         enqueue=True,  # 👈 Async-safe logging
#     )
#
#     # 4. Add Clean Console Sink (Optional: only if not in production)
#     log.add(
#         sys.stdout,
#         format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{message}</cyan>",
#         level="INFO",
#         colorize=True,
#     )
#
#     # 5. Redirect all standard logging to Loguru
#     logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
#
#
# # Export the configured instance
# logger = log


import logging
import sys
from loguru import logger as log

class InterceptHandler(logging.Handler):
    """
    Redirect all standard logging calls to Loguru.
    """
    def emit(self, record: logging.LogRecord):
        try:
            level = log.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find the real caller (skip logging internals)
        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        log.opt(
            depth=depth,
            exception=record.exc_info,
            lazy=True,                # ← small perf improvement
        ).log(level, record.getMessage())


def setup_logger(
    log_level: str = "INFO",
    file_level: str = "DEBUG",
    console_level: str = "INFO",
):
    # 1. Remove default Loguru handler (prevents duplicate colorful output)
    log.remove()

    # 2. Intercept ALL standard logging → send to Loguru
    logging.basicConfig(
        handlers=[InterceptHandler()],
        level=0,           # Capture everything
        force=True
    )

    # 3. Silence / raise level for noisy third-party loggers
    noisy_loggers = [
        "uvicorn",
        "uvicorn.error",
        "uvicorn.access",
        "gunicorn",
        "gunicorn.access",
        "gunicorn.error",
        "asyncio",
        "sqlalchemy.engine",
        "sqlalchemy.pool",
        "aiosqlite",
        "httpx",
        "httpcore",
        "fastapi",
    ]

    for name in noisy_loggers:
        logger = logging.getLogger(name)
        logger.handlers = []           # remove any pre-existing handlers
        logger.propagate = True        # let it go to root (which we intercept)
        logger.setLevel(logging.WARNING)  # or CRITICAL if you want almost silence

    # 4. File sink (detailed, rotated, async-safe)
    log.add(
        "app/logs/app_{time:YYYY-MM-DD}.log",   # daily rotation is often nicer
        rotation="500 MB",                      # or "10 MB" if you prefer smaller files
        retention="14 days",
        compression="zip",
        level=file_level,
        enqueue=True,                           # critical for multi-process
        backtrace=True,
        diagnose=True,                          # helpful in dev
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
    )

    # 5. Clean console sink (human-friendly, no file noise)
    log.add(
        sys.stdout,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{message}</cyan>",
        level=console_level,
        colorize=True,
        enqueue=True,
    )

    log.info("Logging initialized – Loguru is now controlling all output")


# Usage (call this very early – ideally right after imports)
if __name__ == "__main__" or "gunicorn" in sys.modules:
    setup_logger(
        log_level="INFO",
        file_level="DEBUG",     # more detail in files
        console_level="INFO"    # cleaner console
    )


logger = log