import uuid
from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Task, TaskMark, User


def unique_login(prefix: str = "test_tasks") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def register(client: TestClient, cleanup_users: list[str], prefix: str = "test_tasks") -> str:
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


def test_task_crud_archive_restore_and_details(client: TestClient, cleanup_users: list[str]) -> None:
    register(client, cleanup_users)
    task = create_task(client, "Read book")
    task_id = task["id"]

    update_response = client.patch(f"/api/tasks/{task_id}", json={"name": "Read 20 pages"})
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Read 20 pages"

    details_response = client.get(f"/api/tasks/{task_id}")
    assert details_response.status_code == 200
    assert details_response.json()["total_reward"] == 0
    assert details_response.json()["total_punishment"] == 0

    archive_response = client.post(f"/api/tasks/{task_id}/archive")
    assert archive_response.status_code == 200
    assert archive_response.json()["archived_at"] is not None

    active_response = client.get(f"/api/tasks?date={date.today().isoformat()}")
    assert active_response.status_code == 200
    assert active_response.json()["items"] == []

    archived_response = client.get("/api/tasks/archived")
    assert archived_response.status_code == 200
    assert [item["id"] for item in archived_response.json()] == [task_id]

    restore_response = client.post(f"/api/tasks/{task_id}/restore")
    assert restore_response.status_code == 200
    assert restore_response.json()["archived_at"] is None


def test_list_tasks_sorting_pinned_first_latest_pin_wins(
    client: TestClient,
    cleanup_users: list[str],
) -> None:
    register(client, cleanup_users)
    first = create_task(client, "First")
    second = create_task(client, "Second")
    third = create_task(client, "Third")

    assert client.post(f"/api/tasks/{first['id']}/pin").status_code == 200
    assert client.post(f"/api/tasks/{third['id']}/pin").status_code == 200

    response = client.get(f"/api/tasks?date={date.today().isoformat()}")
    assert response.status_code == 200

    names = [item["name"] for item in response.json()["items"]]
    assert names == ["Third", "First", "Second"]

    unpin_response = client.post(f"/api/tasks/{third['id']}/unpin")
    assert unpin_response.status_code == 200
    assert unpin_response.json()["is_pinned"] is False
    assert unpin_response.json()["pinned_at"] is None


def test_list_tasks_history_omits_days_before_created_at(
    client: TestClient,
    cleanup_users: list[str],
) -> None:
    login = register(client, cleanup_users)
    task = create_task(client, "New habit")
    selected_date = date.today() + timedelta(days=3)

    response = client.get(f"/api/tasks?date={selected_date.isoformat()}")
    assert response.status_code == 200

    item = response.json()["items"][0]
    history_dates = [entry["date"] for entry in item["history"]]
    assert history_dates == [
        date.today().isoformat(),
        (date.today() + timedelta(days=1)).isoformat(),
        (date.today() + timedelta(days=2)).isoformat(),
        selected_date.isoformat(),
    ]
    assert item["selected_date_status"] is None
    assert login
    assert task


def test_details_counts_task_totals(client: TestClient, cleanup_users: list[str]) -> None:
    login = register(client, cleanup_users)
    task = create_task(client, "Count me")

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.login == login))
        db.add_all(
            [
                TaskMark(task_id=task["id"], user_id=user.id, mark_date=date.today(), status="reward"),
                TaskMark(
                    task_id=task["id"],
                    user_id=user.id,
                    mark_date=date.today() - timedelta(days=1),
                    status="punishment",
                ),
            ],
        )
        db.commit()

    response = client.get(f"/api/tasks/{task['id']}")

    assert response.status_code == 200
    assert response.json()["total_reward"] == 1
    assert response.json()["total_punishment"] == 1


def test_task_endpoints_require_ownership(client: TestClient, cleanup_users: list[str]) -> None:
    register(client, cleanup_users, "owner")
    task = create_task(client, "Private")
    client.post("/api/auth/logout")

    register(client, cleanup_users, "intruder")

    assert client.get(f"/api/tasks/{task['id']}").status_code == 404
    assert client.patch(f"/api/tasks/{task['id']}", json={"name": "Stolen"}).status_code == 404
    assert client.post(f"/api/tasks/{task['id']}/archive").status_code == 404
    assert client.post(f"/api/tasks/{task['id']}/pin").status_code == 404
    assert client.put(
        f"/api/tasks/{task['id']}/marks/{date.today().isoformat()}",
        json={"status": "reward"},
    ).status_code == 404


def test_create_task_rejects_blank_name(client: TestClient, cleanup_users: list[str]) -> None:
    register(client, cleanup_users)

    response = client.post("/api/tasks", json={"name": "   "})

    assert response.status_code == 422


def test_put_mark_creates_updates_and_deletes_mark(
    client: TestClient,
    cleanup_users: list[str],
) -> None:
    register(client, cleanup_users)
    task = create_task(client, "Track me")
    today = date.today().isoformat()

    create_response = client.put(f"/api/tasks/{task['id']}/marks/{today}", json={"status": "reward"})
    assert create_response.status_code == 200
    assert create_response.json() == {
        "task_id": task["id"],
        "date": today,
        "status": "reward",
    }

    update_response = client.put(f"/api/tasks/{task['id']}/marks/{today}", json={"status": "punishment"})
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "punishment"

    list_response = client.get(f"/api/tasks?date={today}")
    assert list_response.status_code == 200
    assert list_response.json()["items"][0]["selected_date_status"] == "punishment"

    details_response = client.get(f"/api/tasks/{task['id']}")
    assert details_response.status_code == 200
    assert details_response.json()["total_reward"] == 0
    assert details_response.json()["total_punishment"] == 1

    delete_response = client.put(f"/api/tasks/{task['id']}/marks/{today}", json={"status": None})
    assert delete_response.status_code == 200
    assert delete_response.json()["status"] is None

    list_after_delete = client.get(f"/api/tasks?date={today}")
    assert list_after_delete.status_code == 200
    assert list_after_delete.json()["items"][0]["selected_date_status"] is None

    with SessionLocal() as db:
        marks = db.scalars(select(TaskMark).where(TaskMark.task_id == task["id"])).all()
        assert marks == []


def test_put_mark_rejects_invalid_dates(client: TestClient, cleanup_users: list[str]) -> None:
    register(client, cleanup_users)
    task = create_task(client, "Boundaries")
    task_created = date.fromisoformat(task["created_at"][:10])
    before_creation = (task_created - timedelta(days=1)).isoformat()
    future_date = (date.today() + timedelta(days=1)).isoformat()

    before_creation_response = client.put(
        f"/api/tasks/{task['id']}/marks/{before_creation}",
        json={"status": "reward"},
    )
    assert before_creation_response.status_code == 400
    assert before_creation_response.json()["detail"] == "Cannot set mark before task creation date"

    future_response = client.put(
        f"/api/tasks/{task['id']}/marks/{future_date}",
        json={"status": "reward"},
    )
    assert future_response.status_code == 400
    assert future_response.json()["detail"] == "Cannot set mark for a future date"
