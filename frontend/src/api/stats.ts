import { apiClient } from "./client";

export type StatsPeriod = "day" | "week" | "month" | "year" | "all_time";

export type StatsSummary = {
  period: StatsPeriod;
  start_date: string | null;
  end_date: string | null;
  reward_count: number;
  punishment_count: number;
};

export type StatsTaskRow = {
  task_id: string;
  name: string;
  archived_at: string | null;
  reward_count: number;
  punishment_count: number;
};

export type StatsTasks = {
  period: StatsPeriod;
  start_date: string | null;
  end_date: string | null;
  total_reward: number;
  total_punishment: number;
  tasks: StatsTaskRow[];
};

export const statsApi = {
  summary: (period: StatsPeriod, anchorDate: string) =>
    apiClient.get<StatsSummary>(`/api/stats/summary?period=${period}&anchor_date=${anchorDate}`),
  tasks: (period: StatsPeriod, anchorDate: string) =>
    apiClient.get<StatsTasks>(`/api/stats/tasks?period=${period}&anchor_date=${anchorDate}`),
};
