import React from "react";

import type {
  AuthResponse,
  Language,
  LoginPayload,
  RegisterPayload,
  UpdateSettingsPayload,
  User,
  UserSettings,
} from "../../api/auth";
import { authApi } from "../../api/auth";
import { ApiError } from "../../api/client";
import { getDictionary } from "../../i18n";

type AuthState = {
  user: User | null;
  settings: UserSettings | null;
  isLoading: boolean;
  language: Language;
  dictionary: ReturnType<typeof getDictionary>;
  setLanguage: (language: Language) => void;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (payload: UpdateSettingsPayload) => Promise<void>;
};

const AuthContext = React.createContext<AuthState | null>(null);

const applyAuthResponse = (response: AuthResponse) => ({
  user: response.user,
  settings: response.settings,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [settings, setSettings] = React.useState<UserSettings | null>(null);
  const [fallbackLanguage, setFallbackLanguage] = React.useState<Language>("ru");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    authApi
      .me()
      .then((response) => {
        if (!isMounted) {
          return;
        }
        const nextState = applyAuthResponse(response);
        setUser(nextState.user);
        setSettings(nextState.settings);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          return;
        }
        console.error(error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const register = React.useCallback(async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    const nextState = applyAuthResponse(response);
    setUser(nextState.user);
    setSettings(nextState.settings);
  }, []);

  const login = React.useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    const nextState = applyAuthResponse(response);
    setUser(nextState.user);
    setSettings(nextState.settings);
  }, []);

  const logout = React.useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setSettings(null);
  }, []);

  const updateSettings = React.useCallback(async (payload: UpdateSettingsPayload) => {
    const response = await authApi.updateSettings(payload);
    const nextState = applyAuthResponse(response);
    setUser(nextState.user);
    setSettings(nextState.settings);
  }, []);

  const language = settings?.language ?? fallbackLanguage;
  const dictionary = getDictionary(language);

  const value = React.useMemo<AuthState>(
    () => ({
      user,
      settings,
      isLoading,
      language,
      dictionary,
      setLanguage: setFallbackLanguage,
      register,
      login,
      logout,
      updateSettings,
    }),
    [dictionary, isLoading, language, login, logout, register, settings, updateSettings, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
