from datetime import date
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

StatsPeriod = Literal["day", "week", "month", "year", "all_time"]


class StatsSummaryResponse(BaseModel):
    period: StatsPeriod
    start_date: date | None
    end_date: date | None
    reward_count: int
    punishment_count: int


class StatsTaskItem(BaseModel):
    task_id: UUID
    name: str
    archived_at: datetime | None
    reward_count: int
    punishment_count: int


class StatsTasksResponse(BaseModel):
    period: StatsPeriod
    start_date: date | None
    end_date: date | None
    total_reward: int
    total_punishment: int
    tasks: list[StatsTaskItem]
