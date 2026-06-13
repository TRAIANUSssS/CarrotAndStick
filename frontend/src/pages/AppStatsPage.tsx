import React from "react";
import clsx from "clsx";

import { ApiError } from "../api/client";
import { statsApi, type StatsPeriod, type StatsTasks } from "../api/stats";
import { AppScaffold } from "../components/AppScaffold";
import { StatusIcon } from "../components/StatusIcon";
import { useAuth } from "../features/auth/AuthContext";
import { getLocalDateInputValue, getPeriodBounds, shiftAnchorDate } from "../lib/dates";
import { formatDateLabel, formatTimestamp } from "../lib/format";

const STATS_PERIODS: StatsPeriod[] = ["day", "week", "month", "year", "all_time"];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && typeof error.detail === "object" && error.detail !== null) {
    const detail = "detail" in error.detail ? error.detail.detail : undefined;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return fallback;
}

export function AppStatsPage() {
  const { dictionary, language, settings } = useAuth();
  const [period, setPeriod] = React.useState<StatsPeriod>("week");
  const [anchorDate, setAnchorDate] = React.useState(getLocalDateInputValue);
  const [stats, setStats] = React.useState<StatsTasks | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorText, setErrorText] = React.useState<string | null>(null);

  const iconPack = settings?.icon_pack ?? "cookie_whip";

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

  const today = getLocalDateInputValue();
  const { endDate } = getPeriodBounds(anchorDate, period);
  const canNavigatePeriod = period !== "all_time";
  const canNavigateForward = canNavigatePeriod && endDate !== null && endDate < today;

  return (
    <AppScaffold>
      <section className="app-page tasks-page">
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
                className={clsx("period-tabs__item", item === period && "period-tabs__item--active")}
                onClick={() => setPeriod(item)}
                type="button"
                role="tab"
                aria-selected={item === period}
                aria-pressed={item === period}
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
              disabled={!canNavigateForward}
            >
              {dictionary.statsPage.next}
            </button>
          </div>

          <div className="sr-only" aria-live="polite">
            {isLoading ? dictionary.common.loading : ""}
          </div>

          {errorText ? <p className="form-error" role="alert">{errorText}</p> : null}
          {isLoading ? <div className="panel-state">{dictionary.common.loading}</div> : null}

          {!isLoading && stats ? (
            <>
              <div className="stats-summary-grid">
                <div className="detail-grid__card detail-grid__card--reward">
                  <div className="stats-card__label">
                    <StatusIcon iconPack={iconPack} status="reward" label={dictionary.tasksPage.rewardShort} />
                    <span>{dictionary.tasksPage.rewardShort}</span>
                  </div>
                  <strong>{stats.total_reward}</strong>
                </div>
                <div className="detail-grid__card detail-grid__card--punishment">
                  <div className="stats-card__label">
                    <StatusIcon iconPack={iconPack} status="punishment" label={dictionary.tasksPage.punishmentShort} />
                    <span>{dictionary.tasksPage.punishmentShort}</span>
                  </div>
                  <strong>{stats.total_punishment}</strong>
                </div>
              </div>

              {stats.tasks.length === 0 ? (
                <div className="panel-state panel-state--empty">
                  <strong>{dictionary.statsPage.emptyTitle}</strong>
                  <p>{dictionary.statsPage.emptyBody}</p>
                </div>
              ) : (
                <div className="stats-task-list">
                  {stats.tasks.map((task) => (
                    <article key={task.task_id} className="stats-task-row">
                      <div className="stats-task-row__title">
                        <strong>{task.name}</strong>
                        {task.archived_at ? (
                          <span>
                            {dictionary.statsPage.archivedAt}: {formatTimestamp(language, task.archived_at)}
                          </span>
                        ) : null}
                      </div>
                      <div className="stats-task-row__values">
                        <span className="stats-value stats-value--reward">
                          <StatusIcon iconPack={iconPack} status="reward" label={dictionary.tasksPage.rewardShort} />
                          <strong>{task.reward_count}</strong>
                        </span>
                        <span className="stats-value stats-value--punishment">
                          <StatusIcon
                            iconPack={iconPack}
                            status="punishment"
                            label={dictionary.tasksPage.punishmentShort}
                          />
                          <strong>{task.punishment_count}</strong>
                        </span>
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

