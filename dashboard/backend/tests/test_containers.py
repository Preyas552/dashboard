import docker

from tests.conftest import make_fake_container


def test_list_containers(auth_client, fake_docker):
    fake_docker.containers.list.return_value = [
        make_fake_container(id="c1", name="web", status="running"),
        make_fake_container(id="c2", name="db", status="exited"),
    ]

    res = auth_client.get("/containers")

    assert res.status_code == 200
    body = res.json()
    assert len(body) == 2
    assert body[0] == {"id": "c1", "name": "web", "status": "running", "image": "nginx:latest"}


def test_start_container(auth_client, fake_docker):
    container = make_fake_container()
    fake_docker.containers.get.return_value = container

    res = auth_client.post("/containers/c1/start")

    assert res.status_code == 200
    assert res.json() == {"status": "started"}
    container.start.assert_called_once()


def test_stop_nonexistent_container_returns_404(auth_client, fake_docker):
    fake_docker.containers.get.side_effect = docker.errors.NotFound("no such container")

    res = auth_client.post("/containers/doesnotexist/stop")

    assert res.status_code == 404


def test_logs_decoded_to_string(auth_client, fake_docker):
    container = make_fake_container()
    fake_docker.containers.get.return_value = container

    res = auth_client.get("/containers/c1/logs")

    assert res.status_code == 200
    assert res.json() == {"logs": "fake log output"}


def test_docker_daemon_unreachable_returns_503(auth_client, fake_docker):
    fake_docker.containers.list.side_effect = docker.errors.DockerException("connection refused")

    res = auth_client.get("/containers")

    assert res.status_code == 503
