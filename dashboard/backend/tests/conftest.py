import os
import tempfile

import bcrypt

TEST_PASSWORD = "testpass123"

# These env vars must be set before `app.core.config` is ever imported (it reads
# them at module load time), so this runs at the top of conftest.py, before any
# `from app...` import anywhere in the test session.
_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["ADMIN_USERNAME"] = "testadmin"
os.environ["ADMIN_PASSWORD_HASH"] = bcrypt.hashpw(TEST_PASSWORD.encode(), bcrypt.gensalt()).decode()
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DATABASE_URL"] = f"sqlite:///{_db_file.name}"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173"
os.environ["COOKIE_SECURE"] = "false"

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app.main import app
from app.core.docker_client import get_docker_client


def make_fake_container(id="abc123", name="test_container", status="running", image="nginx:latest"):
    container = MagicMock()
    container.short_id = id
    container.name = name
    container.status = status
    container.image.tags = [image]
    container.logs.return_value = b"fake log output"
    return container


@pytest.fixture
def fake_docker():
    return MagicMock()


@pytest.fixture
def client(fake_docker):
    app.dependency_overrides[get_docker_client] = lambda: fake_docker
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_client(client):
    res = client.post("/auth/login", json={"username": "testadmin", "password": TEST_PASSWORD})
    assert res.status_code == 200
    return client
