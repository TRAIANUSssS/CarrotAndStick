import React from "react";
import clsx from "clsx";

import type { IconPackId } from "../api/auth";
import type { StatsPeriod, StatsSummary } from "../api/stats";
import type { TaskHistoryItem, TaskListItem, TaskStatus } from "../api/tasks";
import { formatCompactNumber } from "../lib/format";
import { StatusIcon } from "./StatusIcon";

type HeroStatsProps = {
  language: string;
  iconPack: IconPackId;
  rewardLabel: string;
  punishmentLabel: string;
  summary: StatsSummary | null;
  isLoading: boolean;
};

export function HeroStats({ language, iconPack, rewardLabel, punishmentLabel, summary, isLoading }: HeroStatsProps) {
  const rewardCount = summary?.reward_count ?? 0;
  const punishmentCount = summary?.punishment_count ?? 0;

  return (
    <section className="hero-stats" aria-busy={isLoading}>
      <div className="hero-stats__panel" aria-label={`${rewardLabel}: ${rewardCount}`}>
        <StatusIcon iconPack={iconPack} status="reward" label={rewardLabel} />
        <strong>{formatCompactNumber(language, rewardCount)}</strong>
        <span>{rewardLabel}</span>
      </div>
      <div className="hero-stats__divider" aria-hidden="true" />
      <div className="hero-stats__panel hero-stats__panel--punishment" aria-label={`${punishmentLabel}: ${punishmentCount}`}>
        <StatusIcon iconPack={iconPack} status="punishment" label={punishmentLabel} />
        <strong>{formatCompactNumber(language, punishmentCount)}</strong>
        <span>{punishmentLabel}</span>
      </div>
    </section>
  );
}

type PeriodTabsProps = {
  label: string;
  labels: Record<StatsPeriod, string>;
  periods: StatsPeriod[];
  activePeriod: StatsPeriod;
  onSelectPeriod: (period: StatsPeriod) => void;
};

export function PeriodTabs({ label, labels, periods, activePeriod, onSelectPeriod }: PeriodTabsProps) {
  return (
    <div className="period-tabs" role="tablist" aria-label={label}>
      {periods.map((period) => (
        <button
          key={period}
          className={clsx("period-tabs__item", period === activePeriod && "period-tabs__item--active")}
          onClick={() => onSelectPeriod(period)}
          type="button"
          role="tab"
          aria-selected={period === activePeriod}
        >
          {labels[period]}
        </button>
      ))}
    </div>
  );
}

function getTaskCreatedDate(task: Pick<TaskListItem, "created_at">) {
  return task.created_at.slice(0, 10);
}

type TaskHistoryProps = {
  history: TaskHistoryItem[];
};

export function TaskHistory({ history }: TaskHistoryProps) {
  return (
    <div className="task-history" aria-hidden="true">
      {history.slice(-7).map((entry) => (
        <span
          key={entry.date}
          className={clsx("history-dot", entry.status === "reward" && "history-dot--reward", entry.status === "punishment" && "history-dot--punishment")}
        />
      ))}
    </div>
  );
}

type StatusActionGroupProps = {
  status: TaskStatus;
  iconPack: IconPackId;
  rewardLabel: string;
  punishmentLabel: string;
  removeRewardLabel: string;
  removePunishmentLabel: string;
  disabled: boolean;
  onChange: (status: TaskStatus) => void;
};

function vibrateLightly() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  navigator.vibrate?.(10);
}

export function StatusActionGroup({
  status,
  iconPack,
  rewardLabel,
  punishmentLabel,
  removeRewardLabel,
  removePunishmentLabel,
  disabled,
  onChange,
}: StatusActionGroupProps) {
  const nextRewardStatus = status === "reward" ? null : "reward";
  const nextPunishmentStatus = status === "punishment" ? null : "punishment";

  return (
    <div className="status-action-group">
      <button
        className={clsx("status-action", "status-action--reward", status === "reward" && "status-action--active")}
        onClick={() => {
          vibrateLightly();
          onChange(nextRewardStatus);
        }}
        type="button"
        aria-label={status === "reward" ? removeRewardLabel : rewardLabel}
        aria-pressed={status === "reward"}
        disabled={disabled}
      >
        <StatusIcon iconPack={iconPack} status="reward" label={rewardLabel} />
      </button>
      <button
        className={clsx("status-action", "status-action--punishment", status === "punishment" && "status-action--active")}
        onClick={() => {
          vibrateLightly();
          onChange(nextPunishmentStatus);
        }}
        type="button"
        aria-label={status === "punishment" ? removePunishmentLabel : punishmentLabel}
        aria-pressed={status === "punishment"}
        disabled={disabled}
      >
        <StatusIcon iconPack={iconPack} status="punishment" label={punishmentLabel} />
      </button>
    </div>
  );
}

type TaskRowProps = {
  task: TaskListItem;
  selectedDate: string;
  iconPack: IconPackId;
  rewardLabel: string;
  punishmentLabel: string;
  removeRewardLabel: string;
  removePunishmentLabel: string;
  isLocked: boolean;
  onOpen: (taskId: string) => void;
  onSetStatus: (taskId: string, status: TaskStatus) => void;
};

export function TaskRow({
  task,
  selectedDate,
  iconPack,
  rewardLabel,
  punishmentLabel,
  removeRewardLabel,
  removePunishmentLabel,
  isLocked,
  onOpen,
  onSetStatus,
}: TaskRowProps) {
  const canMarkSelectedDate = selectedDate >= getTaskCreatedDate(task);

  return (
    <article
      className={clsx(
        "task-row",
        task.selected_date_status === "reward" && "task-row--reward",
        task.selected_date_status === "punishment" && "task-row--punishment",
      )}
    >
      <button className="task-row__open" onClick={() => onOpen(task.id)} type="button">
        <h3>{task.name}</h3>
        <TaskHistory history={task.history} />
      </button>
      <StatusActionGroup
        status={task.selected_date_status}
        iconPack={iconPack}
        rewardLabel={rewardLabel}
        punishmentLabel={punishmentLabel}
        removeRewardLabel={removeRewardLabel}
        removePunishmentLabel={removePunishmentLabel}
        disabled={!canMarkSelectedDate || isLocked}
        onChange={(status) => onSetStatus(task.id, status)}
      />
    </article>
  );
}

type TaskGroupProps = {
  storageKey: string;
  title: string;
  count: number;
  icon: "pin" | "list";
  collapseLabel: string;
  expandLabel: string;
  children: React.ReactNode;
};

function readCollapsedState(storageKey: string) {
  try {
    return window.localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

export function TaskGroup({ storageKey, title, count, icon, collapseLabel, expandLabel, children }: TaskGroupProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(() => readCollapsedState(storageKey));

  React.useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, String(isCollapsed));
    } catch {
      // localStorage may be unavailable in restricted browser contexts.
    }
  }, [isCollapsed, storageKey]);

  return (
    <section className="task-group">
      <header className="task-group__header">
        <div className="task-group__title">
          <span className={clsx("task-group__icon", `task-group__icon--${icon}`)} aria-hidden="true" />
          <h2>{title}</h2>
          <span className="task-group__count">{count}</span>
        </div>
        <button
          className="task-group__collapse"
          onClick={() => setIsCollapsed((current) => !current)}
          type="button"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? expandLabel : collapseLabel}
        >
          <span aria-hidden="true">{isCollapsed ? "v" : "^"}</span>
        </button>
      </header>
      <div className={clsx("task-group__content", isCollapsed && "task-group__content--collapsed")}>{children}</div>
    </section>
  );
}
