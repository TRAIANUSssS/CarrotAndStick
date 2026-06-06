from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.task import Task
    from app.models.user import User


class TaskMark(TimestampMixin, Base):
    __tablename__ = "task_marks"
    __table_args__ = (
        UniqueConstraint("task_id", "mark_date", name="uq_task_marks_task_date"),
        CheckConstraint("status in ('reward', 'punishment')", name="ck_task_marks_status"),
        Index("ix_task_marks_user_mark_date", "user_id", "mark_date"),
        Index("ix_task_marks_task_mark_date", "task_id", "mark_date"),
        Index("ix_task_marks_user_status_mark_date", "user_id", "status", "mark_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    mark_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False)

    task: Mapped[Task] = relationship(back_populates="marks")
    user: Mapped[User] = relationship(back_populates="marks")

