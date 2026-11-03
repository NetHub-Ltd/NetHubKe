from app.core.logging import setup_logging
from loguru import logger


def test_setup_logging_runs():
    setup_logging("INFO")
    logger.info("test_log_line")
