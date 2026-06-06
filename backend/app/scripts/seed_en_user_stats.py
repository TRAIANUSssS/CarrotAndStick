from datetime import UTC, date, datetime

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import Task, TaskMark, User, UserSettings


def dt(value: str) -> datetime:
    return datetime.fromisoformat(value).replace(tzinfo=UTC)


TASKS = [
    {
        "name": "Morning run",
        "created_at": dt("2025-12-05T08:00:00"),
        "is_pinned": True,
        "pinned_at": dt("2026-06-03T08:30:00"),
        "marks": {
            date(2026, 1, 8): "reward",
            date(2026, 2, 3): "reward",
            date(2026, 3, 16): "punishment",
            date(2026, 5, 20): "reward",
            date(2026, 6, 2): "reward",
            date(2026, 6, 3): "reward",
            date(2026, 6, 5): "punishment",
            date(2026, 6, 6): "reward",
        },
    },
    {
        "name": "Read 20 pages",
        "created_at": dt("2025-12-18T09:15:00"),
        "marks": {
            date(2026, 2, 10): "reward",
            date(2026, 2, 11): "reward",
            date(2026, 4, 1): "punishment",
            date(2026, 6, 1): "reward",
            date(2026, 6, 4): "reward",
            date(2026, 6, 6): "reward",
        },
    },
    {
        "name": "Inbox zero",
        "created_at": dt("2025-11-10T10:00:00"),
        "marks": {
            date(2026, 4, 21): "punishment",
            date(2026, 4, 22): "reward",
            date(2026, 5, 2): "reward",
            date(2026, 6, 5): "punishment",
        },
    },
    {
        "name": "Strength workout",
        "created_at": dt("2025-10-01T18:00:00"),
        "archived_at": dt("2026-05-28T18:00:00"),
        "marks": {
            date(2026, 3, 1): "reward",
            date(2026, 3, 8): "reward",
            date(2026, 4, 12): "punishment",
            date(2026, 5, 26): "reward",
            date(2026, 5, 27): "punishment",
        },
    },
    {
        "name": "Call parents",
        "created_at": dt("2025-12-28T19:30:00"),
        "marks": {},
    },
    {
        "name": "Side project notes",
        "created_at": dt("2026-06-05T22:00:00"),
        "marks": {
            date(2026, 6, 5): "reward",
            date(2026, 6, 6): "punishment",
        },
    },
]


def main() -> None:
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.login == "en_user"))
        if user is None:
            user = User(login="en_user", password_hash=hash_password("secret-password"))
            db.add(user)
            db.flush()
            db.add(UserSettings(user_id=user.id, language="en", icon_pack="carrot_stick"))
            db.commit()
            db.refresh(user)
        elif user.settings is None:
            db.add(UserSettings(user_id=user.id, language="en", icon_pack="carrot_stick"))
            db.commit()
            db.refresh(user)
        else:
            user.password_hash = hash_password("secret-password")
            user.settings.language = "en"
            user.settings.icon_pack = "carrot_stick"
            db.add_all([user, user.settings])
            db.commit()

        for task in list(user.tasks):
            db.delete(task)
        db.commit()

        for task_data in TASKS:
            task = Task(
                user_id=user.id,
                name=task_data["name"],
                created_at=task_data["created_at"],
                updated_at=task_data["created_at"],
                archived_at=task_data.get("archived_at"),
                is_pinned=task_data.get("is_pinned", False),
                pinned_at=task_data.get("pinned_at"),
            )
            db.add(task)
            db.flush()

            for mark_date, status in task_data["marks"].items():
                db.add(
                    TaskMark(
                        task_id=task.id,
                        user_id=user.id,
                        mark_date=mark_date,
                        status=status,
                        created_at=datetime.combine(mark_date, datetime.min.time(), tzinfo=UTC),
                        updated_at=datetime.combine(mark_date, datetime.min.time(), tzinfo=UTC),
                    ),
                )

        db.commit()

    print("Seeded stats demo data for en_user")


if __name__ == "__main__":
    main()
