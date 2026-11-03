from app.core.idp_claims import extract_roles


def test_standard_roles_claim():
    assert extract_roles({"roles": ["admin", "user"]}) == ["admin", "user"]


def test_standard_groups_claim():
    assert extract_roles({"groups": ["operators", "support"]}) == ["operators", "support"]


def test_configured_nested_role_claim():
    roles = extract_roles(
        {"authorization": {"roles": ["owner", "billing"]}},
        claim_path="authorization.roles",
    )
    assert roles == ["owner", "billing"]


def test_configured_object_claim_uses_keys():
    roles = extract_roles(
        {"urn:example:access": {"owner": {"enabled": True}, "viewer": {}}},
        claim_path="urn:example:access",
    )
    assert roles == ["owner", "viewer"]


def test_roles_and_groups_are_deduplicated():
    roles = extract_roles({"roles": ["admin"], "groups": ["admin", "support"]})
    assert roles == ["admin", "support"]


def test_missing_or_invalid_role_claim_is_empty():
    assert extract_roles({"roles": None, "groups": "not-a-list"}) == []
