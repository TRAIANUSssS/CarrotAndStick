from datetime import date
from typing import Literal

from pydantic import BaseModel

StatsPeriod = Literal["day", "week", "month", "year", "all_time"]


class StatsSummaryResponse(BaseModel):
    period: StatsPeriod
    start_date: date | None
    end_date: date | None
    reward_count: int
    punishment_count: int
