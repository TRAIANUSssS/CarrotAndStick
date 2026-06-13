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

    with SessionLocal() as db:
        owner_record = db.scalar(select(Task).where(Task.id == owner_task["id"]))
        owner_record.created_at = datetime(2026, 6, 1, tzinfo=UTC)
        db.add(owner_record)
        db.commit()

    put_mark(client, owner_task["id"], date(2026, 6, 6), "reward")
    client.post("/api/auth/logout")

    register(client, cleanup_users, "intruder_stats")
    intruder_task = create_task(client, "Intruder task")

    with SessionLocal() as db:
        intruder_record = db.scalar(select(Task).where(Task.id == intruder_task["id"]))
        intruder_record.created_at = datetime(2026, 6, 1, tzinfo=UTC)
        db.add(intruder_record)
        db.commit()

    put_mark(client, intruder_task["id"], date(2026, 6, 6), "punishment")

    response = client.get("/api/stats/summary?period=day&anchor_date=2026-06-06")

    assert response.status_code == 200
    assert response.json()["reward_count"] == 0
    assert response.json()["punishment_count"] == 1

    with SessionLocal() as db:
        owner = db.scalar(select(User).where(User.login == owner_login))
        owner_marks = db.scalars(select(TaskMark).where(TaskMark.user_id == owner.id)).all()
        assert len(owner_marks) == 1


def test_stats_tasks_returns_period_totals_and_zero_rows(client: TestClient, cleanup_users: list[str]) -> None:
    register(client, cleanup_users)
    active_task = create_task(client, "Read book")
    zero_task = create_task(client, "Walk")
    archived_task = create_task(client, "Gym")

    with SessionLocal() as db:
        active = db.scalar(select(Task).where(Task.id == active_task["id"]))
        zero = db.scalar(select(Task).where(Task.id == zero_task["id"]))
        archived = db.scalar(select(Task).where(Task.id == archived_task["id"]))
        active.created_at = datetime(2026, 5, 20, tzinfo=UTC)
        zero.created_at = datetime(2026, 5, 18, tzinfo=UTC)
        archived.created_at = datetime(2026, 5, 10, tzinfo=UTC)
        archived.archived_at = datetime(2026, 6, 5, tzinfo=UTC)
        db.add_all([active, zero, archived])
        db.commit()

    put_mark(client, active_task["id"], date(2026, 6, 2), "reward")
    put_mark(client, active_task["id"], date(2026, 6, 4), "punishment")
    put_mark(client, archived_task["id"], date(2026, 6, 3), "reward")

    response = client.get("/api/stats/tasks?period=week&anchor_date=2026-06-06")

    assert response.status_code == 200
    assert response.json() == {
        "period": "week",
        "start_date": "2026-06-01",
        "end_date": "2026-06-07",
        "total_reward": 2,
        "total_punishment": 1,
        "tasks": [
            {
                "task_id": zero_task["id"],
                "name": "Walk",
                "archived_at": None,
                "reward_count": 0,
                "punishment_count": 0,
            },
            {
                "task_id": active_task["id"],
                "name": "Read book",
                "archived_at": None,
                "reward_count": 1,
                "punishment_count": 1,
            },
            {
                "task_id": archived_task["id"],
                "name": "Gym",
                "archived_at": "2026-06-05T00:00:00Z",
                "reward_count": 1,
                "punishment_count": 0,
            },
        ],
    }


def test_stats_tasks_excludes_tasks_created_after_period_start(client: TestClient, cleanup_users: list[str]) -> None:
    register(client, cleanup_users)
    older_task = create_task(client, "Older")
    newer_task = create_task(client, "Newer")

    with SessionLocal() as db:
        older = db.scalar(select(Task).where(Task.id == older_task["id"]))
        newer = db.scalar(select(Task).where(Task.id == newer_task["id"]))
        older.created_at = datetime(2026, 6, 1, tzinfo=UTC)
        newer.created_at = datetime(2026, 6, 3, tzinfo=UTC)
        db.add_all([older, newer])
        db.commit()

    put_mark(client, older_task["id"], date(2026, 6, 6), "reward")
    put_mark(client, newer_task["id"], date(2026, 6, 6), "punishment")

    response = client.get("/api/stats/tasks?period=week&anchor_date=2026-06-06")

    assert response.status_code == 200
    assert [item["name"] for item in response.json()["tasks"]] == ["Older"]


def test_stats_tasks_all_time_includes_all_user_tasks(client: TestClient, cleanup_users: list[str]) -> None:
    register(client, cleanup_users)
    first = create_task(client, "First")
    second = create_task(client, "Second")

    put_mark(client, first["id"], date.today(), "reward")

    response = client.get(f"/api/stats/tasks?period=all_time&anchor_date={date.today().isoformat()}")

    assert response.status_code == 200
    assert response.json()["total_reward"] == 1
    assert response.json()["total_punishment"] == 0
    assert [item["name"] for item in response.json()["tasks"]] == ["First", "Second"]
