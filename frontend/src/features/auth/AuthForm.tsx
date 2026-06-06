import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import type { Language } from "../../api/auth";
import { ApiError } from "../../api/client";
import { useAuth } from "./AuthContext";

type AuthFormMode = "login" | "register";

const getErrorKey = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "invalidCredentials";
    }
    if (error.status === 409) {
      return "loginTaken";
    }
  }

  return "generic";
};

export function AuthForm({ mode }: { mode: AuthFormMode }) {
  const { user, dictionary, language, setLanguage, login, register } = useAuth();
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorKey, setErrorKey] = React.useState<keyof typeof dictionary.auth.errors | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (user !== null) {
    return <Navigate to="/app/tasks" replace />;
  }

  const isRegister = mode === "register";
  const title = isRegister ? dictionary.auth.registerTitle : dictionary.auth.loginTitle;
  const subtitle = isRegister ? dictionary.auth.registerSubtitle : dictionary.auth.loginSubtitle;
  const submitLabel = isRegister ? dictionary.auth.submitRegister : dictionary.auth.submitLogin;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorKey(null);

    const normalizedLogin = loginValue.trim();
    if (!normalizedLogin || !password) {
      setErrorKey("required");
      return;
    }

    if (isRegister && password.length < 6) {
      setErrorKey("passwordTooShort");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register({ login: normalizedLogin, password, language });
      } else {
        await login({ login: normalizedLogin, password });
      }
      navigate("/app/tasks", { replace: true });
    } catch (error) {
      setErrorKey(getErrorKey(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as Language);
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">
            C&S
          </span>
          <span>{dictionary.app.name}</span>
        </div>

        <header className="auth-header">
          <h1 id="auth-title">{title}</h1>
          <p>{subtitle}</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>{dictionary.auth.login}</span>
            <input
              autoComplete="username"
              maxLength={64}
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
            />
          </label>

          <label>
            <span>{dictionary.auth.password}</span>
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              maxLength={256}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {isRegister ? (
            <label>
              <span>{dictionary.auth.language}</span>
              <select value={language} onChange={handleLanguageChange}>
                <option value="ru">{dictionary.auth.ru}</option>
                <option value="en">{dictionary.auth.en}</option>
              </select>
            </label>
          ) : null}

          {isRegister ? <p className="form-note">{dictionary.auth.noPasswordRecovery}</p> : null}

          {errorKey ? <p className="form-error">{dictionary.auth.errors[errorKey]}</p> : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {submitLabel}
          </button>
        </form>

        <Link className="auth-link" to={isRegister ? "/login" : "/register"}>
          {isRegister ? dictionary.auth.goToLogin : dictionary.auth.goToRegister}
        </Link>
      </section>
    </main>
  );
}

