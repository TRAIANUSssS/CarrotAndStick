import React from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

import type { IconPackId } from "../api/auth";
import { ApiError } from "../api/client";
import type { StatsPeriod, StatsSummary } from "../api/stats";
import { statsApi } from "../api/stats";
import type { TaskDetail, TaskHistoryItem, TaskListItem, TaskStatus } from "../api/tasks";
import { tasksApi } from "../api/tasks";
import { AppScaffold } from "../components/AppScaffold";
import { Modal } from "../components/Modal";
import { StatusIcon } from "../components/StatusIcon";
import { useAuth } from "../features/auth/AuthContext";
import { buildRecentDateRange, clampToToday, getLocalDateInputValue } from "../lib/dates";
import { formatCalendarDate, formatCompactNumber, formatTimestamp } from "../lib/format";

const HOME_PERIODS: StatsPeriod[] = ["all_time", "week", "day", "month", "year"];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && typeof error.detail === "object" && error.detail !== null) {
    const detail = "detail" in error.detail ? error.detail.detail : undefined;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return fallback;
}

function getTaskCreatedDate(task: Pick<TaskListItem, "created_at"> | Pick<TaskDetail, "created_at">) {
  return task.created_at.slice(0, 10);
}

function getTaskStatusText(
  status: TaskStatus,
  labels: {
    reward: string;
    punishment: string;
    empty: string;
  },
) {
  if (status === "reward") {
    return labels.reward;
  }
  if (status === "punishment") {
    return labels.punishment;
  }
  return labels.empty;
}

type SummaryPanelProps = {
  language: string;
  iconPack: IconPackId;
  title: string;
  summaryLabel: string;
  periodLabel: string;
  rewardLabel: string;
  punishmentLabel: string;
  labels: Record<StatsPeriod, string>;
  summary: StatsSummary | null;
  periods: StatsPeriod[];
  activePeriod: StatsPeriod;
  isLoading: boolean;
  onSelectPeriod: (period: StatsPeriod) => void;
};

function SummaryPanel({
  language,
  iconPack,
  title,
  summaryLabel,
  periodLabel,
  rewardLabel,
  punishmentLabel,
  labels,
  summary,
  periods,
  activePeriod,
  isLoading,
  onSelectPeriod,
}: SummaryPanelProps) {
  return (
    <section className="summary-card summary-card--hero">
      <p className="eyebrow">{summaryLabel}</p>
      <div className="summary-hero">
        <div>
          <h1 className="page-title">{title}</h1>
        </div>

        <div className="summary-card__counts" aria-busy={isLoading}>
          <div className="summary-pill summary-pill--reward">
            <StatusIcon iconPack={iconPack} status="reward" label={rewardLabel} />
            <div>
              <span>{rewardLabel}</span>
              <strong>{formatCompactNumber(language, summary?.reward_count ?? 0)}</strong>
            </div>
          </div>
          <div className="summary-pill summary-pill--punishment">
            <StatusIcon iconPack={iconPack} status="punishment" label={punishmentLabel} />
            <div>
              <span>{punishmentLabel}</span>
              <strong>{formatCompactNumber(language, summary?.punishment_count ?? 0)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="period-tabs" role="tablist" aria-label={periodLabel}>
        {periods.map((period) => (
          <button
            key={period}
            className={clsx("period-tabs__item", period === activePeriod && "period-tabs__item--active")}
            onClick={() => onSelectPeriod(period)}
            type="button"
            role="tab"
            aria-selected={period === activePeriod}
            aria-pressed={period === activePeriod}
          >
            {labels[period]}
          </button>
        ))}
      </div>
    </section>
  );
}

type HistoryTone = "reward" | "punishment" | "empty" | "missing";

function getHistoryTone(entry: TaskHistoryItem | undefined, createdDate: string, date: string): HistoryTone {
  if (date < createdDate) {
    return "missing";
  }
  if (entry?.status === "reward") {
    return "reward";
  }
  if (entry?.status === "punishment") {
    return "punishment";
  }
  return "empty";
}

type TaskCardProps = {
  task: TaskListItem;
  selectedDate: string;
  language: string;
  iconPack: IconPackId;
  emptyLabel: string;
  rewardLabel: string;
  punishmentLabel: string;
  rewardShortLabel: string;
  punishmentShortLabel: string;
  onOpen: (taskId: string) => void;
  onSetStatus: (taskId: string, status: TaskStatus) => void;
};

function TaskCard({
  task,
  selectedDate,
  language,
  iconPack,
  emptyLabel,
  rewardLabel,
  punishmentLabel,
  rewardShortLabel,
  punishmentShortLabel,
  onOpen,
  onSetStatus,
}: TaskCardProps) {
  const createdDate = getTaskCreatedDate(task);
  const historyByDate = new Map(task.history.map((entry) => [entry.date, entry]));
  const historyDates = buildRecentDateRange(selectedDate, 5);
  const canMarkSelectedDate = selectedDate >= createdDate;
  const statusText = getTaskStatusText(task.selected_date_status, {
    reward: rewardShortLabel,
    punishment: punishmentShortLabel,
    empty: emptyLabel,
  });

  return (
    <article className="task-card">
      <button className="task-card__body task-card__body--mobile" onClick={() => onOpen(task.id)} type="button">
        <div className="task-card__copy">
          <div className="task-card__title-row">
            <h3>{task.name}</h3>
            <span className="task-card__date">{formatCalendarDate(language, selectedDate)}</span>
          </div>
          <div className="task-card__meta">
            <span>{formatCalendarDate(language, selectedDate)}</span>
            <span className="task-card__meta-separator" aria-hidden="true">
              •
            </span>
            <span>{statusText}</span>
          </div>
        </div>
      </button>

      <div className="task-card__footer">
        <div className="task-history task-history--compact" aria-hidden="true">
          {historyDates.map((date) => {
            const entry = historyByDate.get(date);
            const tone = getHistoryTone(entry, createdDate, date);

            return (
              <span key={date} className={clsx("history-token", "history-token--compact", `history-token--${tone}`)}>
                {tone === "reward" ? <StatusIcon iconPack={iconPack} status="reward" label={rewardLabel} /> : null}
                {tone === "punishment" ? (
                  <StatusIcon iconPack={iconPack} status="punishment" label={punishmentLabel} />
                ) : null}
              </span>
            );
          })}
        </div>

        <div className="task-actions">
        <button
          className={clsx("mark-button", "mark-button--reward", task.selected_date_status === "reward" && "mark-button--active")}
          onClick={(event) => {
            event.stopPropagation();
            onSetStatus(task.id, task.selected_date_status === "reward" ? null : "reward");
          }}
          type="button"
          aria-label={rewardLabel}
          aria-pressed={task.selected_date_status === "reward"}
          disabled={!canMarkSelectedDate}
        >
          <StatusIcon iconPack={iconPack} status="reward" label={rewardLabel} />
        </button>
        <button
          className={clsx(
            "mark-button",
            "mark-button--punishment",
            task.selected_date_status === "punishment" && "mark-button--active",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onSetStatus(task.id, task.selected_date_status === "punishment" ? null : "punishment");
          }}
          type="button"
          aria-label={punishmentLabel}
          aria-pressed={task.selected_date_status === "punishment"}
          disabled={!canMarkSelectedDate}
        >
          <StatusIcon iconPack={iconPack} status="punishment" label={punishmentLabel} />
        </button>
        <button
          className={clsx("mark-button", "mark-button--empty", task.selected_date_status === null && "mark-button--active")}
          onClick={(event) => {
            event.stopPropagation();
            onSetStatus(task.id, null);
          }}
          type="button"
          aria-label={emptyLabel}
          aria-pressed={task.selected_date_status === null}
          disabled={!canMarkSelectedDate}
        >
          <span className="mark-button__empty-circle" aria-hidden="true" />
        </button>
        </div>
      </div>
    </article>
  );
}

type StatsMiniCardProps = {
  iconPack: IconPackId;
  rewardLabel: string;
  punishmentLabel: string;
  rewardCount: number;
  punishmentCount: number;
};

function StatsMiniCard({ iconPack, rewardLabel, punishmentLabel, rewardCount, punishmentCount }: StatsMiniCardProps) {
  return (
    <dl className="detail-grid detail-grid--totals">
      <div className="detail-grid__card detail-grid__card--reward">
        <dt>
          <StatusIcon iconPack={iconPack} status="reward" label={rewardLabel} />
          <span>{rewardLabel}</span>
        </dt>
        <dd>{rewardCount}</dd>
      </div>
      <div className="detail-grid__card detail-grid__card--punishment">
        <dt>
          <StatusIcon iconPack={iconPack} status="punishment" label={punishmentLabel} />
          <span>{punishmentLabel}</span>
        </dt>
        <dd>{punishmentCount}</dd>
      </div>
    </dl>
  );
}

type ArchiveConfirmModalProps = {
  title: string;
  text: string;
  closeLabel: string;
  confirmLabel: string;
  cancelLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

function ArchiveConfirmModal({
  title,
  text,
  closeLabel,
  confirmLabel,
  cancelLabel,
  isSubmitting,
  onClose,
  onConfirm,
}: ArchiveConfirmModalProps) {
  return (
    <Modal title={title} closeLabel={closeLabel} onClose={onClose}>
      <div className="modal-stack">
        <p className="modal-state">{text}</p>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            {cancelLabel}
          </button>
          <button className="danger-button" disabled={isSubmitting} onClick={() => void onConfirm()} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

type AddTaskModalProps = {
  title: string;
  closeLabel: string;
  nameLabel: string;
  placeholder: string;
  saveLabel: string;
  cancelLabel: string;
  errorText: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

function AddTaskModal(props: AddTaskModalProps) {
  const [name, setName] = React.useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await props.onSubmit(name);
  };

  return (
    <Modal title={props.title} closeLabel={props.closeLabel} onClose={props.onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label>
          <span>{props.nameLabel}</span>
          <input
            autoFocus
            maxLength={255}
            placeholder={props.placeholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        {props.errorText ? <p className="form-error">{props.errorText}</p> : null}

        <div className="modal-actions">
          <button className="secondary-button" onClick={props.onClose} type="button">
            {props.cancelLabel}
          </button>
          <button className="primary-button" disabled={props.isSubmitting} type="submit">
            {props.saveLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

type TaskDetailsModalProps = {
  task: TaskDetail | null;
  language: string;
  iconPack: IconPackId;
  closeLabel: string;
  saveLabel: string;
  cancelLabel: string;
  editNameLabel: string;
  createdAtLabel: string;
  rewardTotalLabel: string;
  punishmentTotalLabel: string;
  pinLabel: string;
  unpinLabel: string;
  archiveLabel: string;
  closeText: string;
  loadingText: string;
  errorText: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSaveName: (name: string) => Promise<void>;
  onTogglePin: () => Promise<void>;
  onArchive: () => Promise<void>;
};

function TaskDetailsModal({
  task,
  language,
  iconPack,
  closeLabel,
  saveLabel,
  cancelLabel,
  editNameLabel,
  createdAtLabel,
  rewardTotalLabel,
  punishmentTotalLabel,
  pinLabel,
  unpinLabel,
  archiveLabel,
  closeText,
  loadingText,
  errorText,
  isLoading,
  isSubmitting,
  onClose,
  onSaveName,
  onTogglePin,
  onArchive,
}: TaskDetailsModalProps) {
  const [name, setName] = React.useState(task?.name ?? "");

  React.useEffect(() => {
    setName(task?.name ?? "");
  }, [task?.id, task?.name]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSaveName(name);
  };

  return (
    <Modal title={task?.name ?? loadingText} closeLabel={closeLabel} onClose={onClose}>
      {isLoading || task === null ? (
        <div className="modal-state">{loadingText}</div>
      ) : (
        <div className="modal-stack">
          <dl className="detail-grid">
            <div>
              <dt>{createdAtLabel}</dt>
              <dd>{formatTimestamp(language, task.created_at)}</dd>
            </div>
          </dl>

          <StatsMiniCard
            iconPack={iconPack}
            rewardLabel={rewardTotalLabel}
            punishmentLabel={punishmentTotalLabel}
            rewardCount={task.total_reward}
            punishmentCount={task.total_punishment}
          />

          <form className="modal-form" onSubmit={handleSubmit}>
            <label>
              <span>{editNameLabel}</span>
              <input maxLength={255} value={name} onChange={(event) => setName(event.target.value)} />
            </label>

            {errorText ? <p className="form-error">{errorText}</p> : null}

            <div className="modal-actions">
              <button className="secondary-button" onClick={onClose} type="button">
                {cancelLabel}
              </button>
              <button className="primary-button" disabled={isSubmitting} type="submit">
                {saveLabel}
              </button>
            </div>
          </form>

          <div className="stack-actions">
            <button className="secondary-button" disabled={isSubmitting} onClick={() => void onTogglePin()} type="button">
              {task.is_pinned ? unpinLabel : pinLabel}
            </button>
            <button className="danger-button" disabled={isSubmitting} onClick={() => void onArchive()} type="button">
              {archiveLabel}
            </button>
            <button className="ghost-button" onClick={onClose} type="button">
              {closeText}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function AppTasksPage() {
  const { dictionary, language, settings } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = React.useState(getLocalDateInputValue);
  const [tasks, setTasks] = React.useState<TaskListItem[]>([]);
  const [summary, setSummary] = React.useState<StatsSummary | null>(null);
  const [activePeriod, setActivePeriod] = React.useState<StatsPeriod>("week");
  const [reloadSeed, setReloadSeed] = React.useState(0);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<TaskDetail | null>(null);
  const [isLoadingTasks, setIsLoadingTasks] = React.useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = React.useState(true);
  const [isLoadingTask, setIsLoadingTask] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = React.useState(false);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [modalError, setModalError] = React.useState<string | null>(null);

  const iconPack = settings?.icon_pack ?? "cookie_whip";
  const pinnedTasks = React.useMemo(() => tasks.filter((task) => task.is_pinned), [tasks]);
  const otherTasks = React.useMemo(() => tasks.filter((task) => !task.is_pinned), [tasks]);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoadingTasks(true);
    setPageError(null);

    tasksApi
      .list(selectedDate)
      .then((response) => {
        if (isMounted) {
          setTasks(response.items);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setPageError(getErrorMessage(error, dictionary.common.genericError));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dictionary.common.genericError, reloadSeed, selectedDate]);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoadingSummary(true);
    setPageError(null);

    statsApi
      .summary(activePeriod, selectedDate)
      .then((response) => {
        if (isMounted) {
          setSummary(response);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setPageError(getErrorMessage(error, dictionary.common.genericError));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activePeriod, dictionary.common.genericError, selectedDate]);

  React.useEffect(() => {
    if (selectedTaskId === null) {
      setSelectedTask(null);
      return;
    }

    let isMounted = true;
    setIsLoadingTask(true);
    setModalError(null);

    tasksApi
      .details(selectedTaskId)
      .then((response) => {
        if (isMounted) {
          setSelectedTask(response);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setModalError(getErrorMessage(error, dictionary.common.genericError));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTask(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dictionary.common.genericError, selectedTaskId]);

  const refreshTasks = React.useCallback(() => {
    setReloadSeed((current) => current + 1);
  }, []);

  const refreshSelectedTask = React.useCallback(async () => {
    if (selectedTaskId === null) {
      return;
    }

    setIsLoadingTask(true);
    try {
      setSelectedTask(await tasksApi.details(selectedTaskId));
    } finally {
      setIsLoadingTask(false);
    }
  }, [selectedTaskId]);

  const runMutation = React.useCallback(
    async (action: () => Promise<void>, failureFallback: string) => {
      setIsSubmitting(true);
      setModalError(null);
      setPageError(null);

      try {
        await action();
      } catch (error) {
        const message = getErrorMessage(error, failureFallback);
        setModalError(message);
        setPageError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const handleCreateTask = async (name: string) => {
    await runMutation(async () => {
      await tasksApi.create(name);
      setIsAddModalOpen(false);
      refreshTasks();
    }, dictionary.common.genericError);
  };

  const handleSetTaskStatus = async (taskId: string, nextStatus: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    await runMutation(async () => {
      await tasksApi.setMark(taskId, selectedDate, nextStatus);
      refreshTasks();
      if (selectedTaskId === taskId) {
        await refreshSelectedTask();
      }
    }, dictionary.common.genericError);
  };

  const handleSaveTaskName = async (name: string) => {
    if (selectedTaskId === null) {
      return;
    }

    await runMutation(async () => {
      await tasksApi.update(selectedTaskId, name);
      refreshTasks();
      await refreshSelectedTask();
    }, dictionary.common.genericError);
  };

  const handleTogglePin = async () => {
    if (selectedTaskId === null || selectedTask === null) {
      return;
    }

    await runMutation(async () => {
      if (selectedTask.is_pinned) {
        await tasksApi.unpin(selectedTaskId);
      } else {
        await tasksApi.pin(selectedTaskId);
      }
      refreshTasks();
      await refreshSelectedTask();
    }, dictionary.common.genericError);
  };

  const handleArchive = async () => {
    if (selectedTaskId === null) {
      return;
    }

    await runMutation(async () => {
      await tasksApi.archive(selectedTaskId);
      setIsArchiveConfirmOpen(false);
      setSelectedTaskId(null);
      setSelectedTask(null);
      refreshTasks();
    }, dictionary.common.genericError);
  };

  return (
    <AppScaffold>
      <section className="app-page tasks-page">
        <header className="tasks-screen-header">
          <div className="tasks-screen-header__title">
            <span className="tasks-screen-header__icon">
              <StatusIcon iconPack={iconPack} status="reward" label={dictionary.tasksPage.rewardShort} />
            </span>
            <h1>{dictionary.app.name}</h1>
          </div>
          <button className="ghost-button ghost-button--chip" onClick={() => navigate("/app/tasks/archived")} type="button">
            {dictionary.tasksPage.archived}
          </button>
        </header>

        <SummaryPanel
          language={language}
          iconPack={iconPack}
          title={dictionary.tasksPage.pageTitle}
          summaryLabel={dictionary.tasksPage.summaryLabel}
          periodLabel={dictionary.tasksPage.periodLabel}
          rewardLabel={dictionary.tasksPage.rewardShort}
          punishmentLabel={dictionary.tasksPage.punishmentShort}
          labels={dictionary.periods}
          summary={summary}
          periods={HOME_PERIODS}
          activePeriod={activePeriod}
          isLoading={isLoadingSummary}
          onSelectPeriod={setActivePeriod}
        />

        <div className="sr-only" aria-live="polite">
          {isLoadingSummary ? dictionary.common.loading : ""}
        </div>

        <section className="toolbar-card">
          <div className="toolbar-card__group toolbar-card__group--tasks">
            <label className="field-label">
              <span>{dictionary.tasksPage.selectedDate}</span>
              <input
                className="date-input"
                type="date"
                value={selectedDate}
                max={getLocalDateInputValue()}
                onChange={(event) => setSelectedDate(clampToToday(event.target.value))}
                aria-label={dictionary.tasksPage.selectedDate}
              />
            </label>
            <button className="primary-button primary-button--task-add" onClick={() => setIsAddModalOpen(true)} type="button">
              {dictionary.tasksPage.addTask}
            </button>
          </div>
        </section>

        {pageError ? <p className="form-error" role="alert">{pageError}</p> : null}

        <section className="tasks-board" aria-busy={isLoadingTasks}>
          <header className="tasks-board__header">
            <div>
              <h2>{dictionary.tasksPage.pageTitle}</h2>
            </div>
          </header>

          {isLoadingTasks ? <div className="panel-state">{dictionary.common.loading}</div> : null}

          {!isLoadingTasks && tasks.length === 0 ? (
            <div className="panel-state panel-state--empty">
              <strong>{dictionary.tasksPage.emptyTitle}</strong>
              <p>{dictionary.tasksPage.emptyBody}</p>
            </div>
          ) : null}

          {!isLoadingTasks && tasks.length > 0 ? (
            <div className="task-groups">
              {pinnedTasks.length > 0 ? (
                <section className="task-group">
                  <header className="task-group__header">
                    <span className="task-group__eyebrow">{dictionary.tasksPage.pinnedGroup}</span>
                  </header>
                  <div className="task-list task-list--grouped">
                    {pinnedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        selectedDate={selectedDate}
                        language={language}
                        iconPack={iconPack}
                        emptyLabel={dictionary.tasksPage.emptyMark}
                        rewardLabel={dictionary.tasksPage.reward}
                        punishmentLabel={dictionary.tasksPage.punishment}
                        rewardShortLabel={dictionary.tasksPage.rewardShort}
                        punishmentShortLabel={dictionary.tasksPage.punishmentShort}
                        onOpen={setSelectedTaskId}
                        onSetStatus={(taskId, status) => void handleSetTaskStatus(taskId, status)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {otherTasks.length > 0 ? (
                <section className="task-group">
                  <header className="task-group__header">
                    <span className="task-group__eyebrow">{dictionary.tasksPage.otherGroup}</span>
                  </header>
                  <div className="task-list task-list--grouped">
                    {otherTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        selectedDate={selectedDate}
                        language={language}
                        iconPack={iconPack}
                        emptyLabel={dictionary.tasksPage.emptyMark}
                        rewardLabel={dictionary.tasksPage.reward}
                        punishmentLabel={dictionary.tasksPage.punishment}
                        rewardShortLabel={dictionary.tasksPage.rewardShort}
                        punishmentShortLabel={dictionary.tasksPage.punishmentShort}
                        onOpen={setSelectedTaskId}
                        onSetStatus={(taskId, status) => void handleSetTaskStatus(taskId, status)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </section>
      </section>

      {isAddModalOpen ? (
        <AddTaskModal
          title={dictionary.tasksPage.addTaskTitle}
          closeLabel={dictionary.common.close}
          nameLabel={dictionary.tasksPage.taskName}
          placeholder={dictionary.tasksPage.taskNamePlaceholder}
          saveLabel={dictionary.common.save}
          cancelLabel={dictionary.common.cancel}
          errorText={modalError}
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsAddModalOpen(false);
            setModalError(null);
          }}
          onSubmit={handleCreateTask}
        />
      ) : null}

      {selectedTaskId !== null && !isArchiveConfirmOpen ? (
        <TaskDetailsModal
          task={selectedTask}
          language={language}
          iconPack={iconPack}
          closeLabel={dictionary.common.close}
          saveLabel={dictionary.common.save}
          cancelLabel={dictionary.common.cancel}
          editNameLabel={dictionary.tasksPage.editName}
          createdAtLabel={dictionary.tasksPage.createdAt}
          rewardTotalLabel={dictionary.tasksPage.rewardShort}
          punishmentTotalLabel={dictionary.tasksPage.punishmentShort}
          pinLabel={dictionary.tasksPage.pin}
          unpinLabel={dictionary.tasksPage.unpin}
          archiveLabel={dictionary.tasksPage.archive}
          closeText={dictionary.common.close}
          loadingText={dictionary.common.loading}
          errorText={modalError}
          isLoading={isLoadingTask}
          isSubmitting={isSubmitting}
          onClose={() => {
            setSelectedTaskId(null);
            setSelectedTask(null);
            setIsArchiveConfirmOpen(false);
            setModalError(null);
          }}
          onSaveName={handleSaveTaskName}
          onTogglePin={handleTogglePin}
          onArchive={async () => {
            setIsArchiveConfirmOpen(true);
          }}
        />
      ) : null}

      {isArchiveConfirmOpen ? (
        <ArchiveConfirmModal
          title={dictionary.tasksPage.archiveConfirmTitle}
          text={dictionary.tasksPage.archiveConfirmText}
          closeLabel={dictionary.common.close}
          confirmLabel={dictionary.common.confirm}
          cancelLabel={dictionary.common.cancel}
          isSubmitting={isSubmitting}
          onClose={() => setIsArchiveConfirmOpen(false)}
          onConfirm={handleArchive}
        />
      ) : null}
    </AppScaffold>
  );
}
