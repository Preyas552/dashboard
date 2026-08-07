from tests.conftest import TEST_PASSWORD


def test_login_success(client):
    res = client.post("/auth/login", json={"username": "testadmin", "password": TEST_PASSWORD})
    assert res.status_code == 200
    assert res.json() == {"username": "testadmin"}
    assert "session" in res.cookies


def test_login_wrong_password(client):
    res = client.post("/auth/login", json={"username": "testadmin", "password": "wrong"})
    assert res.status_code == 401


def test_login_wrong_username(client):
    res = client.post("/auth/login", json={"username": "nobody", "password": TEST_PASSWORD})
    assert res.status_code == 401


def test_protected_route_without_session(client):
    res = client.get("/containers")
    assert res.status_code == 401


def test_me_after_login(auth_client):
    res = auth_client.get("/auth/me")
    assert res.status_code == 200
    assert res.json()["username"] == "testadmin"


def test_logout_invalidates_session(auth_client):
    res = auth_client.post("/auth/logout")
    assert res.status_code == 200

    res = auth_client.get("/auth/me")
    assert res.status_code == 401
