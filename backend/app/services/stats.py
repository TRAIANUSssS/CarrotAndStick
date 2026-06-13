from calendar import monthrange
from datetime import date

from sqlalchemy import and_, case, func, outerjoin, select
from sqlalchemy.orm import Session

from app.models import Task, TaskMark, User
from app.schemas.stats import StatsPeriod, StatsSummaryResponse, StatsTaskItem, StatsTasksResponse


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


def get_stats_tasks(db: Session, user: User, period: StatsPeriod, anchor_date: date) -> StatsTasksResponse:
    start_date, end_date = get_period_bounds(period, anchor_date)

    reward_count = func.sum(case((TaskMark.status == "reward", 1), else_=0))
    punishment_count = func.sum(case((TaskMark.status == "punishment", 1), else_=0))

    if period == "all_time":
        join_condition = and_(TaskMark.task_id == Task.id, TaskMark.user_id == user.id)
    else:
        assert start_date is not None
        assert end_date is not None
        join_condition = and_(
            TaskMark.task_id == Task.id,
            TaskMark.user_id == user.id,
            TaskMark.mark_date >= start_date,
            TaskMark.mark_date <= end_date,
        )

    statement = (
        select(Task.id, Task.name, Task.archived_at, reward_count, punishment_count)
        .select_from(outerjoin(Task, TaskMark, join_condition))
        .where(Task.user_id == user.id)
        .group_by(Task.id)
        .order_by(Task.archived_at.is_not(None), Task.created_at.asc(), Task.name.asc())
    )

    if period != "all_time":
        statement = statement.where(func.date(Task.created_at) <= end_date)
        statement = statement.where(
            Task.archived_at.is_(None) | (func.date(Task.archived_at) >= start_date),
        )

    rows = db.execute(statement).all()

    tasks = [
        StatsTaskItem(
            task_id=task_id,
            name=name,
            archived_at=archived_at,
            reward_count=int(rewards or 0),
            punishment_count=int(punishments or 0),
        )
        for task_id, name, archived_at, rewards, punishments in rows
    ]

    return StatsTasksResponse(
        period=period,
        start_date=start_date,
        end_date=end_date,
        total_reward=sum(task.reward_count for task in tasks),
        total_punishment=sum(task.punishment_count for task in tasks),
        tasks=tasks,
    )
