import React from "react";

import type { StatsPeriod, StatsTasks } from "../api/stats";
import { statsApi } from "../api/stats";
import { ApiError } from "../api/client";
import { AppScaffold } from "../components/AppScaffold";
import { useAuth } from "../features/auth/AuthContext";

const STATS_PERIODS: StatsPeriod[] = ["day", "week", "month", "year", "all_time"];

function getLocalDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && typeof error.detail === "object" && error.detail !== null) {
    const detail = "detail" in error.detail ? error.detail.detail : undefined;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return fallback;
}

function formatDateLabel(language: string, value: string | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTimestamp(language: string, value: string | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function shiftAnchorDate(anchorDate: string, period: StatsPeriod, direction: -1 | 1) {
  const [year, month, day] = anchorDate.split("-").map(Number);
  const nextDate = new Date(year, month - 1, day);

  if (period === "day") {
    nextDate.setDate(nextDate.getDate() + direction);
  } else if (period === "week") {
    nextDate.setDate(nextDate.getDate() + direction * 7);
  } else if (period === "month") {
    nextDate.setMonth(nextDate.getMonth() + direction);
  } else if (period === "year") {
    nextDate.setFullYear(nextDate.getFullYear() + direction);
  }

  const nextYear = nextDate.getFullYear();
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, "0");
  const nextDay = String(nextDate.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function AppStatsPage() {
  const { dictionary, language } = useAuth();
  const [period, setPeriod] = React.useState<StatsPeriod>("week");
  const [anchorDate, setAnchorDate] = React.useState(getLocalDateInputValue);
  const [stats, setStats] = React.useState<StatsTasks | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorText, setErrorText] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorText(null);

    statsApi
      .tasks(period, anchorDate)
      .then((response) => {
        if (isMounted) {
          setStats(response);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorText(getErrorMessage(error, dictionary.common.genericError));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [anchorDate, dictionary.common.genericError, period]);

  const canNavigatePeriod = period !== "all_time";

  return (
    <AppScaffold>
      <section className="tasks-page">
        <section className="section-block">
          <header className="section-block__header">
            <div>
              <p className="eyebrow">{dictionary.statsPage.eyebrow}</p>
              <h1 className="page-title">{dictionary.statsPage.title}</h1>
            </div>
          </header>

          <div className="period-tabs" role="tablist" aria-label={dictionary.statsPage.periodSelector}>
            {STATS_PERIODS.map((item) => (
              <button
                key={item}
                className={`period-tabs__item${item === period ? " period-tabs__item--active" : ""}`}
                onClick={() => setPeriod(item)}
                type="button"
              >
                {dictionary.periods[item]}
              </button>
            ))}
          </div>

          <div className="stats-nav">
            <button
              className="secondary-button"
              onClick={() => setAnchorDate((current) => shiftAnchorDate(current, period, -1))}
              type="button"
              disabled={!canNavigatePeriod}
            >
              {dictionary.statsPage.previous}
            </button>
            <div className="stats-range">
              <strong>{stats?.start_date ? formatDateLabel(language, stats.start_date) : dictionary.periods.all_time}</strong>
              {stats?.end_date && stats.start_date !== stats.end_date ? (
                <span>{formatDateLabel(language, stats.end_date)}</span>
              ) : null}
            </div>
            <button
              className="secondary-button"
              onClick={() => setAnchorDate((current) => shiftAnchorDate(current, period, 1))}
              type="button"
              disabled={!canNavigatePeriod}
            >
              {dictionary.statsPage.next}
            </button>
          </div>

          {errorText ? <p className="form-error">{errorText}</p> : null}
          {isLoading ? <div className="panel-state">{dictionary.common.loading}</div> : null}

          {!isLoading && stats ? (
            <>
              <div className="stats-summary-grid">
                <div className="detail-grid__card detail-grid__card--reward">
                  <span>{dictionary.statsPage.totalReward}</span>
                  <strong>{stats.total_reward}</strong>
                </div>
                <div className="detail-grid__card detail-grid__card--punishment">
                  <span>{dictionary.statsPage.totalPunishment}</span>
                  <strong>{stats.total_punishment}</strong>
                </div>
              </div>

              {stats.tasks.length === 0 ? (
                <div className="panel-state panel-state--empty">{dictionary.statsPage.empty}</div>
              ) : (
                <div className="stats-task-list">
                  {stats.tasks.map((task) => (
                    <article key={task.task_id} className="stats-task-row">
                      <div className="stats-task-row__title">
                        <strong>{task.name}</strong>
                        {task.archived_at ? (
                          <span>{dictionary.statsPage.archivedAt}: {formatTimestamp(language, task.archived_at)}</span>
                        ) : null}
                      </div>
                      <div className="stats-task-row__values">
                        <span className="stats-value stats-value--reward">+{task.reward_count}</span>
                        <span className="stats-value stats-value--punishment">-{task.punishment_count}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </section>
      </section>
    </AppScaffold>
  );
}
