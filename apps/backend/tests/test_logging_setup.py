from app.core.logging import get_logger, setup_logging


def test_setup_logging_runs():
    setup_logging("INFO")
    log = get_logger("test")
    log.info("test_log_line")
    log.warning("test_warn_line")
