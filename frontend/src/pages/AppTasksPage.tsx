import React from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

import type { IconPackId } from "../api/auth";
import type { StatsPeriod, StatsSummary } from "../api/stats";
import { statsApi } from "../api/stats";
import type { TaskDetail, TaskListItem, TaskStatus } from "../api/tasks";
import { tasksApi } from "../api/tasks";
import { ApiError } from "../api/client";
import { AppScaffold } from "../components/AppScaffold";
import { Modal } from "../components/Modal";
import carrotPunishmentIcon from "../assets/iconpacks/carrot_stick/punishment.svg";
import carrotRewardIcon from "../assets/iconpacks/carrot_stick/reward.svg";
import cookiePunishmentIcon from "../assets/iconpacks/cookie_whip/punishment.svg";
import cookieRewardIcon from "../assets/iconpacks/cookie_whip/reward.svg";
import { useAuth } from "../features/auth/AuthContext";

const HOME_PERIODS: StatsPeriod[] = ["all_time", "week", "day", "month", "year"];

const ICON_PACKS: Record<IconPackId, { reward: string; punishment: string }> = {
  cookie_whip: {
    reward: cookieRewardIcon,
    punishment: cookiePunishmentIcon,
  },
  carrot_stick: {
    reward: carrotRewardIcon,
    punishment: carrotPunishmentIcon,
  },
};

function getLocalDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clampToToday(value: string) {
  const today = getLocalDateInputValue();
  return value > today ? today : value;
}

function getNextTaskStatus(currentStatus: TaskStatus, clickedStatus: Exclude<TaskStatus, null>): TaskStatus {
  return currentStatus === clickedStatus ? null : clickedStatus;
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

function formatCompactNumber(language: string, value: number) {
  return new Intl.NumberFormat(language, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCalendarDate(language: string, value: string) {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTimestamp(language: string, value: string) {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

type SummaryPanelProps = {
  language: string;
  title: string;
  summaryLabel: string;
  periodLabel: string;
  labels: Record<StatsPeriod, string>;
  summary: StatsSummary | null;
  periods: StatsPeriod[];
  activePeriod: StatsPeriod;
  isLoading: boolean;
  onSelectPeriod: (period: StatsPeriod) => void;
};

function SummaryPanel({
  language,
  title,
  summaryLabel,
  periodLabel,
  labels,
  summary,
  periods,
  activePeriod,
  isLoading,
  onSelectPeriod,
}: SummaryPanelProps) {
  return (
    <section className="summary-card">
      <div className="summary-card__top">
        <div>
          <p className="eyebrow">{summaryLabel}</p>
          <h1 className="page-title">{title}</h1>
        </div>
        <div className="summary-card__counts" aria-busy={isLoading}>
          <div className="summary-pill summary-pill--reward">
            <span>+</span>
            <strong>{formatCompactNumber(language, summary?.reward_count ?? 0)}</strong>
          </div>
          <div className="summary-pill summary-pill--punishment">
            <span>-</span>
            <strong>{formatCompactNumber(language, summary?.punishment_count ?? 0)}</strong>
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

type TaskCardProps = {
  task: TaskListItem;
  language: string;
  iconPack: IconPackId;
  pinnedLabel: string;
  historyLabel: string;
  rewardLabel: string;
  punishmentLabel: string;
  onOpen: (taskId: string) => void;
  onMark: (taskId: string, status: Exclude<TaskStatus, null>) => void;
};

function TaskCard({
  task,
  language,
  iconPack,
  pinnedLabel,
  historyLabel,
  rewardLabel,
  punishmentLabel,
  onOpen,
  onMark,
}: TaskCardProps) {
  const icons = ICON_PACKS[iconPack];

  return (
    <article className="task-card">
      <div className="task-card__header">
        <button className="task-card__body" onClick={() => onOpen(task.id)} type="button">
          <h3>{task.name}</h3>
          {task.is_pinned ? <span className="task-badge">{pinnedLabel}</span> : null}
        </button>
        <div className="task-actions">
          <button
            className={clsx(
              "mark-button",
              task.selected_date_status === "reward" && "mark-button--active mark-button--reward",
            )}
            onClick={(event) => {
              event.stopPropagation();
              onMark(task.id, "reward");
            }}
            type="button"
            aria-label={rewardLabel}
            aria-pressed={task.selected_date_status === "reward"}
          >
            <img src={icons.reward} alt="" aria-hidden="true" />
          </button>
          <button
            className={clsx(
              "mark-button",
              task.selected_date_status === "punishment" && "mark-button--active mark-button--punishment",
            )}
            onClick={(event) => {
              event.stopPropagation();
              onMark(task.id, "punishment");
            }}
            type="button"
            aria-label={punishmentLabel}
            aria-pressed={task.selected_date_status === "punishment"}
          >
            <img src={icons.punishment} alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      <button className="task-card__history" onClick={() => onOpen(task.id)} type="button" aria-label={historyLabel}>
        <div className="history-strip">
          {task.history.map((entry) => (
            <div key={entry.date} className="history-day">
              <span className="history-day__label">
                {new Intl.DateTimeFormat(language, { day: "numeric" }).format(new Date(`${entry.date}T00:00:00`))}
              </span>
              <span
                className={clsx(
                  "history-day__dot",
                  entry.status === "reward" && "history-day__dot--reward",
                  entry.status === "punishment" && "history-day__dot--punishment",
                )}
              />
            </div>
          ))}
        </div>
      </button>
    </article>
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
            <div>
              <dt>{rewardTotalLabel}</dt>
              <dd>{task.total_reward}</dd>
            </div>
            <div>
              <dt>{punishmentTotalLabel}</dt>
              <dd>{task.total_punishment}</dd>
            </div>
          </dl>

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
  const [activePeriod, setActivePeriod] = React.useState<StatsPeriod>("all_time");
  const [rotationSeed, setRotationSeed] = React.useState(0);
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

  const periodLabels = dictionary.periods;
  const iconPack = settings?.icon_pack ?? "cookie_whip";

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
          setPageError(null);
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

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePeriod((currentPeriod) => {
        const currentIndex = HOME_PERIODS.indexOf(currentPeriod);
        return HOME_PERIODS[(currentIndex + 1) % HOME_PERIODS.length];
      });
    }, 15000);

    return () => window.clearInterval(timer);
  }, [rotationSeed]);

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

  const handleSelectPeriod = (period: StatsPeriod) => {
    setActivePeriod(period);
    setRotationSeed((current) => current + 1);
  };

  const handleCreateTask = async (name: string) => {
    await runMutation(async () => {
      await tasksApi.create(name);
      setIsAddModalOpen(false);
      refreshTasks();
    }, dictionary.common.genericError);
  };

  const handleMark = async (taskId: string, clickedStatus: Exclude<TaskStatus, null>) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    const nextStatus = getNextTaskStatus(task.selected_date_status, clickedStatus);
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
      <section className="tasks-page">
        <SummaryPanel
          language={language}
          title={dictionary.tasksPage.pageTitle}
          summaryLabel={dictionary.tasksPage.summaryLabel}
          periodLabel={dictionary.tasksPage.periodLabel}
          labels={periodLabels}
          summary={summary}
          periods={HOME_PERIODS}
          activePeriod={activePeriod}
          isLoading={isLoadingSummary}
          onSelectPeriod={handleSelectPeriod}
        />
        <div className="sr-only" aria-live="polite">
          {isLoadingSummary ? dictionary.common.loading : ""}
        </div>

        <section className="toolbar-card">
          <div className="toolbar-card__group">
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
            <button className="secondary-button" onClick={() => navigate("/app/tasks/archived")} type="button">
              {dictionary.tasksPage.archived}
            </button>
          </div>
          <button className="primary-button" onClick={() => setIsAddModalOpen(true)} type="button">
            {dictionary.tasksPage.addTask}
          </button>
        </section>

        {pageError ? <p className="form-error" role="alert">{pageError}</p> : null}

        <section className="section-block" aria-busy={isLoadingTasks}>
          <header className="section-block__header">
            <div>
              <p className="eyebrow">{dictionary.tasksPage.activeListLabel}</p>
              <h2>{formatCalendarDate(language, selectedDate)}</h2>
            </div>
          </header>

          {isLoadingTasks ? <div className="panel-state">{dictionary.common.loading}</div> : null}

          {!isLoadingTasks && tasks.length === 0 ? (
            <div className="panel-state panel-state--empty">{dictionary.tasksPage.empty}</div>
          ) : null}

          {!isLoadingTasks && tasks.length > 0 ? (
            <div className="task-list">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  language={language}
                  iconPack={iconPack}
                  pinnedLabel={dictionary.tasksPage.pinned}
                  historyLabel={dictionary.tasksPage.historyLabel}
                  rewardLabel={dictionary.tasksPage.reward}
                  punishmentLabel={dictionary.tasksPage.punishment}
                  onOpen={setSelectedTaskId}
                  onMark={(taskId, status) => void handleMark(taskId, status)}
                />
              ))}
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
          closeLabel={dictionary.common.close}
          saveLabel={dictionary.common.save}
          cancelLabel={dictionary.common.cancel}
          editNameLabel={dictionary.tasksPage.editName}
          createdAtLabel={dictionary.tasksPage.createdAt}
          rewardTotalLabel={dictionary.tasksPage.totalReward}
          punishmentTotalLabel={dictionary.tasksPage.totalPunishment}
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
