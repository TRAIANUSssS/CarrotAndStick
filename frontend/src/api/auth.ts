import { apiClient } from "./client";

export type Language = "ru" | "en";
export type IconPackId = "cookie_whip" | "carrot_stick";

export type User = {
  id: string;
  login: string;
};

export type UserSettings = {
  language: Language;
  icon_pack: IconPackId;
};

export type AuthResponse = {
  user: User;
  settings: UserSettings;
};

export type RegisterPayload = {
  login: string;
  password: string;
  language: Language;
};

export type LoginPayload = {
  login: string;
  password: string;
};

export type ChangePasswordPayload = {
  new_password: string;
};

export type UpdateSettingsPayload = {
  language: Language;
  icon_pack: IconPackId;
};

export const authApi = {
  register: (payload: RegisterPayload) => apiClient.post<AuthResponse>("/api/auth/register", payload),
  login: (payload: LoginPayload) => apiClient.post<AuthResponse>("/api/auth/login", payload),
  logout: () => apiClient.post<void>("/api/auth/logout"),
  me: () => apiClient.get<AuthResponse>("/api/auth/me"),
  updateSettings: (payload: UpdateSettingsPayload) => apiClient.put<AuthResponse>("/api/auth/settings", payload),
  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post<void>("/api/auth/change-password", payload),
};
