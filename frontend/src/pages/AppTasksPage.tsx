import React from "react";
import { useNavigate } from "react-router-dom";

import type { IconPackId } from "../api/auth";
import { ApiError } from "../api/client";
import type { StatsPeriod, StatsSummary } from "../api/stats";
import { statsApi } from "../api/stats";
import type { TaskDetail, TaskListItem, TaskStatus } from "../api/tasks";
import { tasksApi } from "../api/tasks";
import { AppScaffold } from "../components/AppScaffold";
import { Modal } from "../components/Modal";
import { StatusIcon } from "../components/StatusIcon";
import { HeroStats, PeriodTabs, TaskGroup, TaskRow } from "../components/TasksCore";
import { useToast } from "../components/Toast";
import { useAuth } from "../features/auth/AuthContext";
import { clampToToday, getLocalDateInputValue } from "../lib/dates";
import { formatTimestamp } from "../lib/format";

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

function sortPinnedTasks(tasks: TaskListItem[]) {
  return [...tasks].sort((left, right) => {
    const leftPinned = left.pinned_at ?? left.created_at;
    const rightPinned = right.pinned_at ?? right.created_at;
    return leftPinned.localeCompare(rightPinned) || left.created_at.localeCompare(right.created_at);
  });
}

function sortOtherTasks(tasks: TaskListItem[]) {
  return [...tasks].sort((left, right) => left.created_at.localeCompare(right.created_at));
}

function updateTaskStatusLocally(
  items: TaskListItem[],
  taskId: string,
  selectedDate: string,
  nextStatus: TaskStatus,
) {
  return items.map((item) => {
    if (item.id !== taskId) {
      return item;
    }

    const historyByDate = new Map(item.history.map((entry) => [entry.date, entry.status]));
    historyByDate.set(selectedDate, nextStatus);
    const history = Array.from(historyByDate.entries())
      .map(([date, status]) => ({ date, status }))
      .filter((entry) => entry.date >= getTaskCreatedDate(item))
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-7);

    return {
      ...item,
      selected_date_status: nextStatus,
      history,
    };
  });
}

function adjustSummary(summary: StatsSummary | null, previousStatus: TaskStatus, nextStatus: TaskStatus) {
  if (summary === null || previousStatus === nextStatus) {
    return summary;
  }

  const rewardDelta = (nextStatus === "reward" ? 1 : 0) - (previousStatus === "reward" ? 1 : 0);
  const punishmentDelta = (nextStatus === "punishment" ? 1 : 0) - (previousStatus === "punishment" ? 1 : 0);

  return {
    ...summary,
    reward_count: Math.max(0, summary.reward_count + rewardDelta),
    punishment_count: Math.max(0, summary.punishment_count + punishmentDelta),
  };
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
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = React.useState(getLocalDateInputValue);
  const [tasks, setTasks] = React.useState<TaskListItem[]>([]);
  const [summary, setSummary] = React.useState<StatsSummary | null>(null);
  const [activePeriod, setActivePeriod] = React.useState<StatsPeriod>("week");
  const [reloadSeed, setReloadSeed] = React.useState(0);
  const [summaryReloadSeed, setSummaryReloadSeed] = React.useState(0);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<TaskDetail | null>(null);
  const [lockedTaskIds, setLockedTaskIds] = React.useState<Set<string>>(() => new Set());
  const [isLoadingTasks, setIsLoadingTasks] = React.useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = React.useState(true);
  const [isLoadingTask, setIsLoadingTask] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = React.useState(false);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [modalError, setModalError] = React.useState<string | null>(null);

  const iconPack = settings?.icon_pack ?? "cookie_whip";
  const pinnedTasks = React.useMemo(() => sortPinnedTasks(tasks.filter((task) => task.is_pinned)), [tasks]);
  const otherTasks = React.useMemo(() => sortOtherTasks(tasks.filter((task) => !task.is_pinned)), [tasks]);

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
  }, [activePeriod, dictionary.common.genericError, selectedDate, summaryReloadSeed]);

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

  const refreshSummary = React.useCallback(() => {
    setSummaryReloadSeed((current) => current + 1);
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
    if (!task || lockedTaskIds.has(taskId)) {
      return;
    }

    const previousTasks = tasks;
    const previousSummary = summary;
    const previousStatus = task.selected_date_status;
    const startedAt = window.performance.now();

    setLockedTaskIds((current) => new Set(current).add(taskId));
    setPageError(null);
    setTasks((current) => updateTaskStatusLocally(current, taskId, selectedDate, nextStatus));
    setSummary((current) => adjustSummary(current, previousStatus, nextStatus));

    try {
      await tasksApi.setMark(taskId, selectedDate, nextStatus);
      refreshTasks();
      refreshSummary();
      if (selectedTaskId === taskId) {
        await refreshSelectedTask();
      }
    } catch {
      setTasks(previousTasks);
      setSummary(previousSummary);
      showToast(dictionary.tasksPage.markSaveError);
    } finally {
      const elapsed = window.performance.now() - startedAt;
      window.setTimeout(
        () => {
          setLockedTaskIds((current) => {
            const next = new Set(current);
            next.delete(taskId);
            return next;
          });
        },
        Math.max(0, 300 - elapsed),
      );
    }
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
      refreshSummary();
    }, dictionary.common.genericError);
  };

  return (
    <AppScaffold>
      <section className="app-page tasks-page">
        <header className="tasks-screen-header">
          <div className="tasks-screen-header__spacer" aria-hidden="true" />
          <h1>{dictionary.app.name}</h1>
          <button
            className="archive-icon-button"
            onClick={() => navigate("/app/tasks/archived")}
            type="button"
            aria-label={dictionary.tasksPage.archived}
          >
            <span className="archive-icon" aria-hidden="true" />
          </button>
        </header>

        <HeroStats
          language={language}
          iconPack={iconPack}
          rewardLabel={dictionary.tasksPage.rewardShort}
          punishmentLabel={dictionary.tasksPage.punishmentShort}
          summary={summary}
          isLoading={isLoadingSummary}
        />

        <PeriodTabs
          label={dictionary.tasksPage.periodLabel}
          labels={dictionary.periods}
          periods={HOME_PERIODS}
          activePeriod={activePeriod}
          onSelectPeriod={setActivePeriod}
        />

        <div className="sr-only" aria-live="polite">
          {isLoadingSummary ? dictionary.common.loading : ""}
        </div>

        <section className="toolbar-card" aria-label={dictionary.tasksPage.selectedDate}>
          <div className="date-action-row">
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
            <button
              className="primary-button primary-button--task-add"
              onClick={() => setIsAddModalOpen(true)}
              type="button"
              aria-label={dictionary.tasksPage.addTask}
            >
              {dictionary.tasksPage.addTask}
            </button>
          </div>
        </section>

        {pageError ? <p className="form-error" role="alert">{pageError}</p> : null}

        <section className="tasks-list-section" aria-busy={isLoadingTasks} aria-label={dictionary.tasksPage.activeListLabel}>
          {isLoadingTasks ? <div className="panel-state">{dictionary.common.loading}</div> : null}

          {!isLoadingTasks && tasks.length === 0 ? (
            <div className="panel-state panel-state--empty">
              <strong>{dictionary.tasksPage.emptyTitle}</strong>
              <p>{dictionary.tasksPage.emptyBody}</p>
            </div>
          ) : null}

          {!isLoadingTasks && tasks.length > 0 ? (
            <>
              {pinnedTasks.length > 0 ? (
                <TaskGroup
                  storageKey="tasks.group.pinned.collapsed"
                  title={dictionary.tasksPage.pinnedGroup}
                  count={pinnedTasks.length}
                  icon="pin"
                  collapseLabel={dictionary.tasksPage.collapsePinnedGroup}
                  expandLabel={dictionary.tasksPage.expandPinnedGroup}
                >
                  <div className="task-list task-list--grouped">
                    {pinnedTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        selectedDate={selectedDate}
                        iconPack={iconPack}
                        rewardLabel={dictionary.tasksPage.reward}
                        punishmentLabel={dictionary.tasksPage.punishment}
                        removeRewardLabel={dictionary.tasksPage.removeReward}
                        removePunishmentLabel={dictionary.tasksPage.removePunishment}
                        isLocked={lockedTaskIds.has(task.id)}
                        onOpen={setSelectedTaskId}
                        onSetStatus={(rowTaskId, status) => void handleSetTaskStatus(rowTaskId, status)}
                      />
                    ))}
                  </div>
                </TaskGroup>
              ) : null}

              {otherTasks.length > 0 ? (
                <TaskGroup
                  storageKey="tasks.group.other.collapsed"
                  title={dictionary.tasksPage.otherGroup}
                  count={otherTasks.length}
                  icon="list"
                  collapseLabel={dictionary.tasksPage.collapseOtherGroup}
                  expandLabel={dictionary.tasksPage.expandOtherGroup}
                >
                  <div className="task-list task-list--grouped">
                    {otherTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        selectedDate={selectedDate}
                        iconPack={iconPack}
                        rewardLabel={dictionary.tasksPage.reward}
                        punishmentLabel={dictionary.tasksPage.punishment}
                        removeRewardLabel={dictionary.tasksPage.removeReward}
                        removePunishmentLabel={dictionary.tasksPage.removePunishment}
                        isLocked={lockedTaskIds.has(task.id)}
                        onOpen={setSelectedTaskId}
                        onSetStatus={(rowTaskId, status) => void handleSetTaskStatus(rowTaskId, status)}
                      />
                    ))}
                  </div>
                </TaskGroup>
              ) : null}

              <p className="tasks-hint">{dictionary.tasksPage.hint}</p>
            </>
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
