from datetime import date

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.stats import StatsPeriod, StatsSummaryResponse
from app.services.stats import get_stats_summary

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/summary", response_model=StatsSummaryResponse)
def summary(period: StatsPeriod, anchor_date: date, current_user: CurrentUser, db: DbSession) -> StatsSummaryResponse:
    return get_stats_summary(db, current_user, period, anchor_date)
