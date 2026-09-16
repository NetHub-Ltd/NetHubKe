from app.utils import logging as logmod


def test_logger_exists():
    assert hasattr(logmod, "logger")
