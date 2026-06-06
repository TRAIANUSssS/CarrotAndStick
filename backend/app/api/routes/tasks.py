from datetime import date
from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.tasks import (
    TaskCreateRequest,
    TaskDetailResponse,
    TaskListResponse,
    TaskRead,
    TaskUpdateRequest,
)
from app.services.tasks import (
    archive_task,
    create_task,
    get_task_details,
    list_active_task_items,
    list_archived_tasks,
    pin_task,
    restore_task,
    unpin_task,
    update_task,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse)
def list_tasks(date: date, current_user: CurrentUser, db: DbSession) -> TaskListResponse:
    return TaskListResponse(items=list_active_task_items(db, current_user, date))


@router.post("", response_model=TaskRead, status_code=201)
def create(payload: TaskCreateRequest, current_user: CurrentUser, db: DbSession) -> TaskRead:
    return create_task(db, current_user, payload.name)


@router.get("/archived", response_model=list[TaskRead])
def archived(current_user: CurrentUser, db: DbSession) -> list[TaskRead]:
    return list_archived_tasks(db, current_user)


@router.get("/{task_id}", response_model=TaskDetailResponse)
def details(task_id: UUID, current_user: CurrentUser, db: DbSession) -> TaskDetailResponse:
    return get_task_details(db, current_user, task_id)


@router.patch("/{task_id}", response_model=TaskRead)
def update(task_id: UUID, payload: TaskUpdateRequest, current_user: CurrentUser, db: DbSession) -> TaskRead:
    return update_task(db, current_user, task_id, payload.name)


@router.post("/{task_id}/archive", response_model=TaskRead)
def archive(task_id: UUID, current_user: CurrentUser, db: DbSession) -> TaskRead:
    return archive_task(db, current_user, task_id)


@router.post("/{task_id}/restore", response_model=TaskRead)
def restore(task_id: UUID, current_user: CurrentUser, db: DbSession) -> TaskRead:
    return restore_task(db, current_user, task_id)


@router.post("/{task_id}/pin", response_model=TaskRead)
def pin(task_id: UUID, current_user: CurrentUser, db: DbSession) -> TaskRead:
    return pin_task(db, current_user, task_id)


@router.post("/{task_id}/unpin", response_model=TaskRead)
def unpin(task_id: UUID, current_user: CurrentUser, db: DbSession) -> TaskRead:
    return unpin_task(db, current_user, task_id)

