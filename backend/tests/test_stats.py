import uuid
from datetime import date
from datetime import datetime, UTC

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Task, TaskMark, User


def unique_login(prefix: str = "test_stats") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def register(client: TestClient, cleanup_users: list[str], prefix: str = "test_stats") -> str:
    login = unique_login(prefix)
    cleanup_users.append(login)
    response = client.post(
        "/api/auth/register",
        json={"login": login, "password": "secret-password", "language": "ru"},
    )
    assert response.status_code == 201
    return login


def create_task(client: TestClient, name: str) -> dict:
    response = client.post("/api/tasks", json={"name": name})
    assert response.status_code == 201
    return response.json()


def put_mark(client: TestClient, task_id: str, mark_date: date, status: str) -> None:
    response = client.put(f"/api/tasks/{task_id}/marks/{mark_date.isoformat()}", json={"status": status})
    assert response.status_code == 200


def test_stats_summary_counts_selected_periods(client: TestClient, cleanup_users: list[str]) -> None:
    register(client, cleanup_users)
    task = create_task(client, "Track")

    with SessionLocal() as db:
        task_record = db.scalar(select(Task).where(Task.id == task["id"]))
        task_record.created_at = datetime(2026, 1, 1, tzinfo=UTC)
        db.add(task_record)
        db.commit()

    put_mark(client, task["id"], date(2026, 6, 6), "reward")
    put_mark(client, task["id"], date(2026, 6, 5), "punishment")
    put_mark(client, task["id"], date(2026, 6, 1), "reward")
    put_mark(client, task["id"], date(2026, 1, 10), "punishment")

    day_response = client.get("/api/stats/summary?period=day&anchor_date=2026-06-06")
    assert day_response.status_code == 200
    assert day_response.json() == {
        "period": "day",
        "start_date": "2026-06-06",
        "end_date": "2026-06-06",
        "reward_count": 1,
        "punishment_count": 0,
    }

    week_response = client.get("/api/stats/summary?period=week&anchor_date=2026-06-06")
    assert week_response.status_code == 200
    assert week_response.json() == {
        "period": "week",
        "start_date": "2026-06-01",
        "end_date": "2026-06-07",
        "reward_count": 2,
        "punishment_count": 1,
    }

    month_response = client.get("/api/stats/summary?period=month&anchor_date=2026-06-06")
    assert month_response.status_code == 200
    assert month_response.json() == {
        "period": "month",
        "start_date": "2026-06-01",
        "end_date": "2026-06-30",
        "reward_count": 2,
        "punishment_count": 1,
    }

    year_response = client.get("/api/stats/summary?period=year&anchor_date=2026-06-06")
    assert year_response.status_code == 200
    assert year_response.json() == {
        "period": "year",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "reward_count": 2,
        "punishment_count": 2,
    }

    all_time_response = client.get("/api/stats/summary?period=all_time&anchor_date=2026-06-06")
    assert all_time_response.status_code == 200
    assert all_time_response.json() == {
        "period": "all_time",
        "start_date": None,
        "end_date": None,
        "reward_count": 2,
        "punishment_count": 2,
    }


def test_stats_summary_requires_auth(client: TestClient) -> None:
    response = client.get("/api/stats/summary?period=week&anchor_date=2026-06-06")

    assert response.status_code == 401


def test_stats_summary_is_scoped_to_current_user(client: TestClient, cleanup_users: list[str]) -> None:
    owner_login = register(client, cleanup_users, "owner_stats")
    owner_task = create_task(client, "Owner task")
    put_mark(client, owner_task["id"], date(2026, 6, 6), "reward")
    client.post("/api/auth/logout")

    register(client, cleanup_users, "intruder_stats")
    intruder_task = create_task(client, "Intruder task")
    put_mark(client, intruder_task["id"], date(2026, 6, 6), "punishment")

    response = client.get("/api/stats/summary?period=day&anchor_date=2026-06-06")

    assert response.status_code == 200
    assert response.json()["reward_count"] == 0
    assert response.json()["punishment_count"] == 1

    with SessionLocal() as db:
        owner = db.scalar(select(User).where(User.login == owner_login))
        owner_marks = db.scalars(select(TaskMark).where(TaskMark.user_id == owner.id)).all()
        assert len(owner_marks) == 1
