import docker

_client: docker.DockerClient | None = None


def get_docker_client() -> docker.DockerClient:
    global _client
    if _client is None:
        _client = docker.from_env()
    return _client
