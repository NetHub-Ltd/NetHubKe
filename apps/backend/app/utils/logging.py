# # logger.py
# import sys
# import os
# import logging
# from loguru import logger as log
#
# ENV = os.getenv("ENV", "dev").lower()
# LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG" if ENV == "dev" else "INFO")
#
#
# # ----------------------------
# # 🎨 Custom Level Colors (Pill Style)
# # ----------------------------
# log.level("DEBUG", color="<black><bg #2196F3>")
# log.level("INFO", color="<black><bg #4CAF50>")
# log.level("WARNING", color="<black><bg #FFC107>")
# log.level("ERROR", color="<white><bg #F44336>")
# log.level("CRITICAL", color="<white><bg #9C27B0>")
#
#
# # ----------------------------
# # 🔌 Intercept Standard Logging
# # ----------------------------
# class InterceptHandler(logging.Handler):
#     def emit(self, record):
#         try:
#             level = log.level(record.levelname).name
#         except Exception:
#             level = record.levelno
#
#         log.bind(
#             logger_name=record.name
#         ).opt(
#             depth=6,
#             exception=record.exc_info
#         ).log(level, record.getMessage())
#
#
# def setup_intercept():
#     logging.root.handlers = [InterceptHandler()]
#     logging.root.setLevel(LOG_LEVEL)
#
#     # intercept uvicorn loggers
#     for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
#         logging.getLogger(name).handlers = [InterceptHandler()]
#
#
# # ----------------------------
# # 🧱 Logger Setup
# # ----------------------------
# def setup_logger():
#     log.remove()
#
#     # Pretty console logs (dev)
#     log.add(
#         sys.stdout,
#         level=LOG_LEVEL,
#         colorize=True,
#         backtrace=ENV == "dev",
#         diagnose=ENV == "dev",
#         format=(
#             "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
#             "<level> {level:^8} </level> | "
#             "<cyan>{extra[request_id]}</cyan> | "
#             "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
#             "<level>{message}</level>"
#         ),
#     )
#
#     # File logs (JSON for production)
#     log.add(
#         "logs/app.log",
#         level="INFO",
#         rotation="10 MB",
#         retention="14 days",
#         compression="zip",
#         serialize=True,   # JSON logs
#         enqueue=True,     # async logging (production safe)
#     )
#
#     setup_intercept()
#
#     return log
#
#
# # Initialize once
# logger = setup_logger()

#
# # logger.py
# import sys
# import os
# import logging
# from loguru import logger as log
#
# ENV = os.getenv("ENV", "dev").lower()
# LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")  # default to INFO to reduce noise
#
#
# # ----------------------------
# # 🎨 LEVEL STYLES (MATCH YOUR SCREENSHOT)
# # ----------------------------
# LEVEL_STYLES = {
#     "DEBUG": "<black><bg #607D8B>",   # grey-blue
#     "INFO": "<black><bg #26A69A>",    # teal (matches your screenshot)
#     "WARNING": "<black><bg #FFB300>", # amber
#     "ERROR": "<white><bg #E53935>",   # red
#     "CRITICAL": "<white><bg #8E24AA>" # purple
# }
#
# for level, style in LEVEL_STYLES.items():
#     log.level(level, color=style)
#
#
# # ----------------------------
# # 🔇 NOISE FILTER
# # ----------------------------
# NOISY_LOGGERS = (
#     "watchfiles",
#     "uvicorn.error",
#     "uvicorn.access",
#     "uvicorn.reload",
#     "asyncio",
# )
#
# def noise_filter(record):
#     name = record["name"]
#
#     # filter noisy modules
#     if any(name.startswith(n) for n in NOISY_LOGGERS):
#         return False
#
#     # drop DEBUG logs in dev unless explicitly needed
#     if record["level"].name == "DEBUG" and ENV != "dev":
#         return False
#
#     return True
#
#
# # ----------------------------
# # 🔌 INTERCEPT STANDARD LOGGING
# # ----------------------------
# class InterceptHandler(logging.Handler):
#     def emit(self, record):
#         try:
#             level = log.level(record.levelname).name
#         except Exception:
#             level = record.levelno
#
#         log.opt(
#             depth=6,
#             exception=record.exc_info
#         ).log(level, record.getMessage())
#
#
# def setup_intercept():
#     logging.root.handlers = [InterceptHandler()]
#     logging.root.setLevel(LOG_LEVEL)
#
#     for name in logging.root.manager.loggerDict.keys():
#         logging.getLogger(name).handlers = [InterceptHandler()]
#
#
# # ----------------------------
# # 🧱 LOGGER SETUP
# # ----------------------------
# def setup_logger():
#     log.remove()
#
#     # 🎯 THIS FORMAT MATCHES YOUR SCREENSHOT
#     log.add(
#         sys.stdout,
#         level=LOG_LEVEL,
#         colorize=True,
#         filter=noise_filter,
#         format=(
#             "<level>{level: <8}</level> "
#             "<white>{message}</white>"
#         ),
#     )
#
#     # 📦 File logging (clean JSON)
#     log.add(
#         "logs/app.log",
#         level="INFO",
#         rotation="10 MB",
#         retention="14 days",
#         compression="zip",
#         serialize=True,
#         enqueue=True,
#     )
#
#     setup_intercept()
#     return log
#
#
# logger = setup_logger()


import sys
import os
import logging
from loguru import logger as loguru_logger

ENV = os.getenv("ENV", "dev").lower()
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# ----------------------------
# 🎨 LEVEL COLORS (with nice backgrounds like your screenshot)
# ----------------------------
LEVEL_STYLES = {
    "DEBUG":    "<black><bg #607D8B>",   # grey-blue
    "INFO":     "<black><bg #26A69A>",   # teal (matches your screenshot)
    "WARNING":  "<black><bg #FFB300>",   # amber
    "ERROR":    "<white><bg #E53935>",   # red
    "CRITICAL": "<white><bg #8E24AA>",   # purple
}

for level_name, color in LEVEL_STYLES.items():
    loguru_logger.level(level_name, color=color)

# ----------------------------
# 🔇 NOISE FILTER
# ----------------------------
NOISY_LOGGERS = {"watchfiles", "uvicorn.access", "uvicorn.reload", "asyncio"}

def noise_filter(record):
    name = record["name"]
    if any(name.startswith(noisy) for noisy in NOISY_LOGGERS):
        return False
    # In non-dev, drop DEBUG unless explicitly wanted
    if record["level"].name == "DEBUG" and ENV != "dev":
        return False
    return True

# ----------------------------
# 🔌 INTERCEPT STANDARD LOGGING (cleaner version)
# ----------------------------
class InterceptHandler(logging.Handler):
    def emit(self, record):
        # Convert standard logging level to Loguru level
        try:
            level = loguru_logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        loguru_logger.opt(
            depth=6,
            exception=record.exc_info
        ).log(level, record.getMessage())


def setup_intercept():
    # Replace root handlers
    logging.root.handlers = [InterceptHandler()]
    logging.root.setLevel(LOG_LEVEL)

    # Propagate everything through our interceptor
    for logger_name in logging.root.manager.loggerDict:
        logger_obj = logging.getLogger(logger_name)
        logger_obj.handlers = []
        logger_obj.propagate = True


# ----------------------------
# 🧱 MAIN LOGGER SETUP
# ----------------------------
def setup_logger():
    loguru_logger.remove()  # Clear default handlers

    # === Console sink (beautiful colored output) ===
    loguru_logger.add(
        sys.stdout,
        level=LOG_LEVEL,
        colorize=True,
        filter=noise_filter,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "<level>{message}</level>"
        ),
        enqueue=True,        # safer with async / multiple workers
    )

    # === File sink (structured JSON, clean for production) ===
    loguru_logger.add(
        "logs/app_{time:YYYY-MM-DD}.log",   # daily files recommended
        level="INFO",
        rotation="10 MB",
        retention="14 days",
        compression="zip",
        serialize=True,      # JSON format
        enqueue=True,
        backtrace=True,
        diagnose=ENV == "dev",
    )

    setup_intercept()
    return loguru_logger


# Initialize
logger = setup_logger()