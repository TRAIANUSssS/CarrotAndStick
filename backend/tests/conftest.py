from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

from app.db.session import SessionLocal
from app.main import app
from app.models import User
from app.core.security import settings as security_settings


@pytest.fixture(autouse=True)
def use_test_jwt_secret() -> None:
    security_settings.jwt_secret = "test-secret-with-at-least-32-bytes"


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def cleanup_users() -> Generator[list[str], None, None]:
    logins: list[str] = []

    yield logins

    if not logins:
        return

    with SessionLocal() as db:
        db.execute(delete(User).where(User.login.in_(logins)))
        db.commit()
