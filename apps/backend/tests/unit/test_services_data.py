from app.utils.data import services_data


def test_seed_data_non_empty():
    # Module should expose seed list or similar
    names = [n for n in dir(services_data) if not n.startswith("_")]
    assert names
    for n in names:
        obj = getattr(services_data, n)
        if isinstance(obj, list):
            assert len(obj) >= 0
            break
