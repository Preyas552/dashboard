import docker

from tests.conftest import make_fake_container


def _valid_schedule(**overrides):
    body = {
        "name": "nightly-restart",
        "cron_expression": "0 2 * * *",
        "container_id": "c1",
        "container_name": "web",
        "action": "restart",
    }
    body.update(overrides)
    return body


def test_create_schedule(auth_client, fake_docker):
    fake_docker.containers.get.return_value = make_fake_container(id="c1")

    res = auth_client.post("/schedules", json=_valid_schedule())

    assert res.status_code == 201
    body = res.json()
    assert body["name"] == "nightly-restart"
    assert body["enabled"] is True


def test_create_schedule_invalid_cron(auth_client, fake_docker):
    fake_docker.containers.get.return_value = make_fake_container(id="c1")

    res = auth_client.post("/schedules", json=_valid_schedule(cron_expression="not a cron"))

    assert res.status_code == 400


def test_create_schedule_container_not_found(auth_client, fake_docker):
    fake_docker.containers.get.side_effect = docker.errors.NotFound("no such container")

    res = auth_client.post("/schedules", json=_valid_schedule())

    assert res.status_code == 404


def test_list_schedules_includes_created(auth_client, fake_docker):
    fake_docker.containers.get.return_value = make_fake_container(id="c1")
    auth_client.post("/schedules", json=_valid_schedule(name="list-me"))

    res = auth_client.get("/schedules")

    assert res.status_code == 200
    assert any(s["name"] == "list-me" for s in res.json())


def test_disable_schedule(auth_client, fake_docker):
    fake_docker.containers.get.return_value = make_fake_container(id="c1")
    created = auth_client.post("/schedules", json=_valid_schedule(name="toggle-me")).json()

    res = auth_client.patch(f"/schedules/{created['id']}", json={"enabled": False})

    assert res.status_code == 200
    assert res.json()["enabled"] is False


def test_delete_schedule(auth_client, fake_docker):
    fake_docker.containers.get.return_value = make_fake_container(id="c1")
    created = auth_client.post("/schedules", json=_valid_schedule(name="delete-me")).json()

    res = auth_client.delete(f"/schedules/{created['id']}")
    assert res.status_code == 204

    res = auth_client.get("/schedules")
    assert not any(s["name"] == "delete-me" for s in res.json())


def test_delete_nonexistent_schedule_returns_404(auth_client):
    res = auth_client.delete("/schedules/999999")
    assert res.status_code == 404
