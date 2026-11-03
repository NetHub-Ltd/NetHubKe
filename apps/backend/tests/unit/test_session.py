from app.db import session as sess


def test_engine_exists():
    assert sess.engine is not None
