import React from "react";
import { useNavigate } from "react-router-dom";

import type { IconPackId } from "../api/auth";
import { ApiError } from "../api/client";
import type { StatsPeriod, StatsSummary } from "../api/stats";
import { statsApi } from "../api/stats";
import type { TaskDetail, TaskListItem, TaskStatus } from "../api/tasks";
import { tasksApi } from "../api/tasks";
import { AppScaffold } from "../components/AppScaffold";
import { BottomSheet } from "../components/BottomSheet";
import { StatusIcon } from "../components/StatusIcon";
import { HeroStats, PeriodTabs, TaskGroup, TaskHistory, TaskRow } from "../components/TasksCore";
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

type AddTaskModalProps = {
  title: string;
  closeLabel: string;
  nameLabel: string;
  pinLabel: string;
  placeholder: string;
  createLabel: string;
  errorText: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (name: string, shouldPin: boolean) => Promise<void>;
};

function AddTaskModal(props: AddTaskModalProps) {
  const [name, setName] = React.useState("");
  const [shouldPin, setShouldPin] = React.useState(false);
  const trimmedName = name.trim();
  const isValid = trimmedName.length > 0 && trimmedName.length <= 80;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      return;
    }
    await props.onSubmit(trimmedName, shouldPin);
  };

  return (
    <BottomSheet
      title={props.title}
      closeLabel={props.closeLabel}
      onClose={props.onClose}
      actions={
        <button className="primary-button bottom-sheet__primary" disabled={props.isSubmitting || !isValid} form="create-task-form" type="submit">
          {props.createLabel}
        </button>
      }
    >
      <form id="create-task-form" className="modal-form" onSubmit={handleSubmit}>
        <label>
          <span>{props.nameLabel}</span>
          <input
            autoFocus
            maxLength={80}
            placeholder={props.placeholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="pin-checkbox">
          <input checked={shouldPin} onChange={(event) => setShouldPin(event.target.checked)} type="checkbox" />
          <span>{props.pinLabel}</span>
        </label>

        {props.errorText ? <p className="form-error">{props.errorText}</p> : null}
      </form>
    </BottomSheet>
  );
}

type TaskDetailsModalProps = {
  task: TaskDetail | null;
  language: string;
  iconPack: IconPackId;
  title: string;
  closeLabel: string;
  saveLabel: string;
  editNameLabel: string;
  createdAtLabel: string;
  rewardTotalLabel: string;
  punishmentTotalLabel: string;
  pinLabel: string;
  unpinLabel: string;
  archiveLabel: string;
  restoreArchiveHint: string;
  loadingText: string;
  errorText: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  history: TaskListItem["history"];
  onClose: () => void;
  onSaveName: (name: string) => Promise<void>;
  onTogglePin: () => Promise<void>;
  onArchive: () => Promise<void>;
};

function TaskDetailsModal({
  task,
  language,
  iconPack,
  title,
  closeLabel,
  saveLabel,
  editNameLabel,
  createdAtLabel,
  rewardTotalLabel,
  punishmentTotalLabel,
  pinLabel,
  unpinLabel,
  archiveLabel,
  restoreArchiveHint,
  loadingText,
  errorText,
  isLoading,
  isSubmitting,
  history,
  onClose,
  onSaveName,
  onTogglePin,
  onArchive,
}: TaskDetailsModalProps) {
  const [name, setName] = React.useState(task?.name ?? "");

  React.useEffect(() => {
    setName(task?.name ?? "");
  }, [task?.id, task?.name]);

  const trimmedName = name.trim();
  const savedName = task?.name ?? "";
  const hasNameChanges = task !== null && trimmedName !== savedName;
  const isNameValid = trimmedName.length > 0 && trimmedName.length <= 80;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasNameChanges || !isNameValid) {
      return;
    }
    await onSaveName(trimmedName);
  };

  return (
    <BottomSheet
      title={task === null && isLoading ? loadingText : title}
      closeLabel={closeLabel}
      onClose={onClose}
      actions={
        task ? (
          <>
            {hasNameChanges ? (
              <button
                className="primary-button bottom-sheet__primary"
                disabled={isSubmitting || !isNameValid}
                form="edit-task-form"
                type="submit"
              >
                {saveLabel}
              </button>
            ) : null}
            <button className="danger-button bottom-sheet__primary" disabled={isSubmitting} onClick={() => void onArchive()} type="button">
              {archiveLabel}
            </button>
            {!hasNameChanges ? <p className="bottom-sheet__hint">{restoreArchiveHint}</p> : null}
          </>
        ) : null
      }
    >
      {isLoading || task === null ? <div className="modal-state">{loadingText}</div> : null}
      {!isLoading && task !== null ? (
        <div className="task-sheet">
          <form id="edit-task-form" className="modal-form" onSubmit={handleSubmit}>
            <label>
              <span>{editNameLabel}</span>
              <input maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          </form>

          <button className="task-sheet__pin" disabled={isSubmitting} onClick={() => void onTogglePin()} type="button">
            {task.is_pinned ? unpinLabel : pinLabel}
          </button>

          <StatsMiniCard
            iconPack={iconPack}
            rewardLabel={rewardTotalLabel}
            punishmentLabel={punishmentTotalLabel}
            rewardCount={task.total_reward}
            punishmentCount={task.total_punishment}
          />

          <dl className="detail-grid">
            <div>
              <dt>{createdAtLabel}</dt>
              <dd>{formatTimestamp(language, task.created_at)}</dd>
            </div>
          </dl>

          <div className="task-sheet__history">
            <TaskHistory history={history} />
          </div>

          {errorText ? <p className="form-error">{errorText}</p> : null}
        </div>
      ) : null}
    </BottomSheet>
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
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [modalError, setModalError] = React.useState<string | null>(null);

  const iconPack = settings?.icon_pack ?? "cookie_whip";
  const pinnedTasks = React.useMemo(() => sortPinnedTasks(tasks.filter((task) => task.is_pinned)), [tasks]);
  const otherTasks = React.useMemo(() => sortOtherTasks(tasks.filter((task) => !task.is_pinned)), [tasks]);
  const selectedTaskListItem = React.useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );

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

  const handleCreateTask = async (name: string, shouldPin: boolean) => {
    await runMutation(async () => {
      const createdTask = await tasksApi.create(name);
      if (shouldPin) {
        try {
          await tasksApi.pin(createdTask.id);
        } catch {
          showToast(dictionary.tasksPage.createPinnedError);
        }
      }
      setIsAddModalOpen(false);
      refreshTasks();
      refreshSummary();
    }, dictionary.tasksPage.taskSaveError);
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

    setIsSubmitting(true);
    setModalError(null);
    try {
      await tasksApi.update(selectedTaskId, name);
      refreshTasks();
      await refreshSelectedTask();
    } catch {
      showToast(dictionary.tasksPage.taskSaveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async () => {
    if (selectedTaskId === null || selectedTask === null) {
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      if (selectedTask.is_pinned) {
        await tasksApi.unpin(selectedTaskId);
      } else {
        await tasksApi.pin(selectedTaskId);
      }
      refreshTasks();
      await refreshSelectedTask();
    } catch {
      showToast(dictionary.tasksPage.taskSaveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (selectedTaskId === null) {
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      await tasksApi.archive(selectedTaskId);
      setSelectedTaskId(null);
      setSelectedTask(null);
      refreshTasks();
      refreshSummary();
    } catch {
      showToast(dictionary.tasksPage.taskSaveError);
    } finally {
      setIsSubmitting(false);
    }
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
          pinLabel={dictionary.tasksPage.pinTask}
          placeholder={dictionary.tasksPage.taskNamePlaceholder}
          createLabel={dictionary.common.create}
          errorText={modalError}
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsAddModalOpen(false);
            setModalError(null);
          }}
          onSubmit={handleCreateTask}
        />
      ) : null}

      {selectedTaskId !== null ? (
        <TaskDetailsModal
          task={selectedTask}
          language={language}
          iconPack={iconPack}
          title={dictionary.tasksPage.editTitle}
          closeLabel={dictionary.common.close}
          saveLabel={dictionary.common.save}
          editNameLabel={dictionary.tasksPage.editName}
          createdAtLabel={dictionary.tasksPage.createdAt}
          rewardTotalLabel={dictionary.tasksPage.rewardShort}
          punishmentTotalLabel={dictionary.tasksPage.punishmentShort}
          pinLabel={dictionary.tasksPage.pinTask}
          unpinLabel={dictionary.tasksPage.unpinTask}
          archiveLabel={dictionary.tasksPage.archive}
          restoreArchiveHint={dictionary.tasksPage.restoreArchiveHint}
          loadingText={dictionary.common.loading}
          errorText={modalError}
          isLoading={isLoadingTask}
          isSubmitting={isSubmitting}
          history={selectedTaskListItem?.history ?? []}
          onClose={() => {
            setSelectedTaskId(null);
            setSelectedTask(null);
            setModalError(null);
          }}
          onSaveName={handleSaveTaskName}
          onTogglePin={handleTogglePin}
          onArchive={handleArchive}
        />
      ) : null}
    </AppScaffold>
  );
}
