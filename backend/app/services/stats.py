from calendar import monthrange
from datetime import date

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models import TaskMark, User
from app.schemas.stats import StatsPeriod, StatsSummaryResponse


def get_period_bounds(period: StatsPeriod, anchor_date: date) -> tuple[date | None, date | None]:
    if period == "day":
        return anchor_date, anchor_date
    if period == "week":
        start_date = anchor_date.fromordinal(anchor_date.toordinal() - anchor_date.weekday())
        end_date = start_date.fromordinal(start_date.toordinal() + 6)
        return start_date, end_date
    if period == "month":
        start_date = anchor_date.replace(day=1)
        end_date = anchor_date.replace(day=monthrange(anchor_date.year, anchor_date.month)[1])
        return start_date, end_date
    if period == "year":
        return anchor_date.replace(month=1, day=1), anchor_date.replace(month=12, day=31)
    return None, None


def get_stats_summary(db: Session, user: User, period: StatsPeriod, anchor_date: date) -> StatsSummaryResponse:
    start_date, end_date = get_period_bounds(period, anchor_date)

    reward_count = func.sum(case((TaskMark.status == "reward", 1), else_=0))
    punishment_count = func.sum(case((TaskMark.status == "punishment", 1), else_=0))

    statement = select(reward_count, punishment_count).where(TaskMark.user_id == user.id)
    if start_date is not None and end_date is not None:
        statement = statement.where(TaskMark.mark_date >= start_date, TaskMark.mark_date <= end_date)

    totals = db.execute(statement).one()

    return StatsSummaryResponse(
        period=period,
        start_date=start_date,
        end_date=end_date,
        reward_count=int(totals[0] or 0),
        punishment_count=int(totals[1] or 0),
    )
