from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

TaskStatus = str | None
MarkStatus = Literal["reward", "punishment"] | None


class TaskCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Task name is required")
        return normalized


class TaskUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Task name is required")
        return normalized


class TaskHistoryItem(BaseModel):
    date: date
    status: TaskStatus


class TaskListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    created_at: datetime
    archived_at: datetime | None
    is_pinned: bool
    pinned_at: datetime | None
    selected_date_status: TaskStatus
    history: list[TaskHistoryItem]


class TaskListResponse(BaseModel):
    items: list[TaskListItem]


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    created_at: datetime
    archived_at: datetime | None
    is_pinned: bool
    pinned_at: datetime | None


class TaskDetailResponse(TaskRead):
    total_reward: int
    total_punishment: int


class TaskMarkUpsertRequest(BaseModel):
    status: MarkStatus


class TaskMarkResponse(BaseModel):
    task_id: UUID
    date: date
    status: MarkStatus
