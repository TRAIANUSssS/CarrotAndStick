import { apiClient } from "./client";

export type TaskStatus = "reward" | "punishment" | null;

export type TaskHistoryItem = {
  date: string;
  status: TaskStatus;
};

export type TaskListItem = {
  id: string;
  name: string;
  created_at: string;
  archived_at: string | null;
  is_pinned: boolean;
  pinned_at: string | null;
  selected_date_status: TaskStatus;
  history: TaskHistoryItem[];
};

export type TaskListResponse = {
  items: TaskListItem[];
};

export type TaskRead = {
  id: string;
  name: string;
  created_at: string;
  archived_at: string | null;
  is_pinned: boolean;
  pinned_at: string | null;
};

export type TaskDetail = TaskRead & {
  total_reward: number;
  total_punishment: number;
};

export type TaskMarkResponse = {
  task_id: string;
  date: string;
  status: TaskStatus;
};

export const tasksApi = {
  list: (selectedDate: string) => apiClient.get<TaskListResponse>(`/api/tasks?date=${selectedDate}`),
  create: (name: string) => apiClient.post<TaskRead>("/api/tasks", { name }),
  update: (taskId: string, name: string) => apiClient.patch<TaskRead>(`/api/tasks/${taskId}`, { name }),
  details: (taskId: string) => apiClient.get<TaskDetail>(`/api/tasks/${taskId}`),
  archive: (taskId: string) => apiClient.post<TaskRead>(`/api/tasks/${taskId}/archive`),
  restore: (taskId: string) => apiClient.post<TaskRead>(`/api/tasks/${taskId}/restore`),
  archived: () => apiClient.get<TaskRead[]>("/api/tasks/archived"),
  pin: (taskId: string) => apiClient.post<TaskRead>(`/api/tasks/${taskId}/pin`),
  unpin: (taskId: string) => apiClient.post<TaskRead>(`/api/tasks/${taskId}/unpin`),
  setMark: (taskId: string, markDate: string, status: TaskStatus) =>
    apiClient.put<TaskMarkResponse>(`/api/tasks/${taskId}/marks/${markDate}`, { status }),
};
