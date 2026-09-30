from app.core.idp_claims import extract_roles


def test_keycloak_realm_access():
    roles = extract_roles({"realm_access": {"roles": ["admin", "user"]}})
    assert roles == ["admin", "user"]


def test_zitadel_project_roles():
    roles = extract_roles(
        {"urn:zitadel:iam:org:project:roles": {"org:owner": {}, "viewer": {}}}
    )
    assert "org:owner" in roles
    assert "viewer" in roles


def test_groups_fallback():
    roles = extract_roles({"groups": ["g1", "g2"]})
    assert roles == ["g1", "g2"]


def test_merge_unique():
    roles = extract_roles(
        {
            "realm_access": {"roles": ["a"]},
            "groups": ["a", "b"],
        }
    )
    assert roles == ["a", "b"]
