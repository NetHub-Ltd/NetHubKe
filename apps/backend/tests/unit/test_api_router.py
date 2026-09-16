from app.api.v1.api_router import router


def test_router_prefix():
    assert router.prefix == "/api/v1"
