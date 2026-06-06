from datetime import UTC, date, datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import Select, case, func, select
from sqlalchemy.orm import Session

from app.models import Task, TaskMark, User
from app.schemas.tasks import TaskDetailResponse, TaskHistoryItem, TaskListItem, TaskMarkResponse


def get_user_task(db: Session, user: User, task_id: UUID) -> Task:
    task = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user.id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def build_task_sort(statement: Select[tuple[Task]]) -> Select[tuple[Task]]:
    return statement.order_by(Task.is_pinned.desc(), Task.pinned_at.desc().nullslast(), Task.created_at.asc())


def create_task(db: Session, user: User, name: str) -> Task:
    task = Task(user_id=user.id, name=name)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, user: User, task_id: UUID, name: str) -> Task:
    task = get_user_task(db, user, task_id)
    task.name = name
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def archive_task(db: Session, user: User, task_id: UUID) -> Task:
    task = get_user_task(db, user, task_id)
    if task.archived_at is None:
        task.archived_at = datetime.now(UTC)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def restore_task(db: Session, user: User, task_id: UUID) -> Task:
    task = get_user_task(db, user, task_id)
    task.archived_at = None
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def pin_task(db: Session, user: User, task_id: UUID) -> Task:
    task = get_user_task(db, user, task_id)
    task.is_pinned = True
    task.pinned_at = datetime.now(UTC)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def unpin_task(db: Session, user: User, task_id: UUID) -> Task:
    task = get_user_task(db, user, task_id)
    task.is_pinned = False
    task.pinned_at = None
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def list_archived_tasks(db: Session, user: User) -> list[Task]:
    return list(
        db.scalars(
            select(Task)
            .where(Task.user_id == user.id, Task.archived_at.is_not(None))
            .order_by(Task.archived_at.desc(), Task.created_at.asc()),
        ),
    )


def get_task_details(db: Session, user: User, task_id: UUID) -> TaskDetailResponse:
    task = get_user_task(db, user, task_id)
    totals = get_task_totals(db, user, [task.id])
    reward_count, punishment_count = totals.get(task.id, (0, 0))

    return TaskDetailResponse(
        id=task.id,
        name=task.name,
        created_at=task.created_at,
        archived_at=task.archived_at,
        is_pinned=task.is_pinned,
        pinned_at=task.pinned_at,
        total_reward=reward_count,
        total_punishment=punishment_count,
    )


def list_active_task_items(db: Session, user: User, selected_date: date) -> list[TaskListItem]:
    tasks = list(
        db.scalars(
            build_task_sort(
                select(Task).where(Task.user_id == user.id, Task.archived_at.is_(None)),
            ),
        ),
    )
    if not tasks:
        return []

    task_ids = [task.id for task in tasks]
    history_start = min(max(task.created_at.date(), selected_date - timedelta(days=6)) for task in tasks)
    marks = list(
        db.scalars(
            select(TaskMark).where(
                TaskMark.user_id == user.id,
                TaskMark.task_id.in_(task_ids),
                TaskMark.mark_date >= history_start,
                TaskMark.mark_date <= selected_date,
            ),
        ),
    )
    marks_by_task_date = {(mark.task_id, mark.mark_date): mark.status for mark in marks}

    items: list[TaskListItem] = []
    for task in tasks:
        task_start = max(task.created_at.date(), selected_date - timedelta(days=6))
        history_dates = [task_start + timedelta(days=offset) for offset in range((selected_date - task_start).days + 1)]
        history = [
            TaskHistoryItem(
                date=history_date,
                status=marks_by_task_date.get((task.id, history_date)),
            )
            for history_date in history_dates
        ]

        items.append(
            TaskListItem(
                id=task.id,
                name=task.name,
                created_at=task.created_at,
                archived_at=task.archived_at,
                is_pinned=task.is_pinned,
                pinned_at=task.pinned_at,
                selected_date_status=marks_by_task_date.get((task.id, selected_date)),
                history=history,
            ),
        )

    return items


def get_task_totals(db: Session, user: User, task_ids: list[UUID]) -> dict[UUID, tuple[int, int]]:
    if not task_ids:
        return {}

    reward_count = func.sum(case((TaskMark.status == "reward", 1), else_=0))
    punishment_count = func.sum(case((TaskMark.status == "punishment", 1), else_=0))

    rows = db.execute(
        select(TaskMark.task_id, reward_count, punishment_count)
        .where(TaskMark.user_id == user.id, TaskMark.task_id.in_(task_ids))
        .group_by(TaskMark.task_id),
    ).all()

    return {
        task_id: (int(rewards or 0), int(punishments or 0))
        for task_id, rewards, punishments in rows
    }


def set_task_mark(
    db: Session,
    user: User,
    task_id: UUID,
    mark_date: date,
    mark_status: str | None,
) -> TaskMarkResponse:
    task = get_user_task(db, user, task_id)
    created_on = task.created_at.date()
    today = datetime.now(UTC).date()

    if mark_date < created_on:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot set mark before task creation date",
        )
    if mark_date > today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot set mark for a future date",
        )

    existing_mark = db.scalar(
        select(TaskMark).where(
            TaskMark.task_id == task.id,
            TaskMark.user_id == user.id,
            TaskMark.mark_date == mark_date,
        ),
    )

    if mark_status is None:
        if existing_mark is not None:
            db.delete(existing_mark)
            db.commit()
        return TaskMarkResponse(task_id=task.id, date=mark_date, status=None)

    if existing_mark is None:
        existing_mark = TaskMark(
            task_id=task.id,
            user_id=user.id,
            mark_date=mark_date,
            status=mark_status,
        )
    else:
        existing_mark.status = mark_status

    db.add(existing_mark)
    db.commit()

    return TaskMarkResponse(task_id=task.id, date=mark_date, status=mark_status)
