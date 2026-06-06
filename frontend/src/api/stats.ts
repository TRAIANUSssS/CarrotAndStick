import { apiClient } from "./client";

export type StatsPeriod = "day" | "week" | "month" | "year" | "all_time";

export type StatsSummary = {
  period: StatsPeriod;
  start_date: string | null;
  end_date: string | null;
  reward_count: number;
  punishment_count: number;
};

export const statsApi = {
  summary: (period: StatsPeriod, anchorDate: string) =>
    apiClient.get<StatsSummary>(`/api/stats/summary?period=${period}&anchor_date=${anchorDate}`),
};
