import docker
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.core.docker_client import get_docker_client

router = APIRouter(
    prefix="/containers", tags=["containers"], dependencies=[Depends(get_current_user)]
)


class ContainerSummary(BaseModel):
    id: str
    name: str
    status: str
    image: str


@router.get("", response_model=list[ContainerSummary])
def list_containers(client: docker.DockerClient = Depends(get_docker_client)):
    containers = client.containers.list(all=True)
    return [
        ContainerSummary(
            id=c.short_id,
            name=c.name,
            status=c.status,
            image=c.image.tags[0] if c.image.tags else c.image.short_id,
        )
        for c in containers
    ]


def _get_container(client: docker.DockerClient, container_id: str):
    try:
        return client.containers.get(container_id)
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail=f"container '{container_id}' not found")


@router.post("/{container_id}/start")
def start_container(container_id: str, client: docker.DockerClient = Depends(get_docker_client)):
    _get_container(client, container_id).start()
    return {"status": "started"}


@router.post("/{container_id}/stop")
def stop_container(container_id: str, client: docker.DockerClient = Depends(get_docker_client)):
    _get_container(client, container_id).stop()
    return {"status": "stopped"}


@router.post("/{container_id}/restart")
def restart_container(container_id: str, client: docker.DockerClient = Depends(get_docker_client)):
    _get_container(client, container_id).restart()
    return {"status": "restarted"}


@router.get("/{container_id}/logs")
def get_logs(container_id: str, tail: int = 100, client: docker.DockerClient = Depends(get_docker_client)):
    container = _get_container(client, container_id)
    logs = container.logs(tail=tail).decode("utf-8", errors="replace")
    return {"logs": logs}
