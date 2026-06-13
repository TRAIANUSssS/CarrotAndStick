import React from "react";

import { authApi, type IconPackId, type Language } from "../api/auth";
import { ApiError } from "../api/client";
import { AppScaffold } from "../components/AppScaffold";
import { StatusIcon } from "../components/StatusIcon";
import { useAuth } from "../features/auth/AuthContext";
import { ICON_PACK_OPTIONS } from "../lib/iconPacks";

function getPasswordErrorKey(error: unknown) {
  if (error instanceof ApiError && error.status === 400) {
    return "invalidOldPassword" as const;
  }

  return "generic" as const;
}

export function AppAccountPage() {
  const { dictionary, logout, settings, updateSettings, user } = useAuth();
  const [language, setLanguage] = React.useState<Language>("ru");
  const [iconPack, setIconPack] = React.useState<IconPackId>("cookie_whip");
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [repeatPassword, setRepeatPassword] = React.useState("");
  const [settingsMessage, setSettingsMessage] = React.useState<string | null>(null);
  const [settingsError, setSettingsError] = React.useState<keyof typeof dictionary.accountPage.errors | null>(null);
  const [passwordMessage, setPasswordMessage] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<keyof typeof dictionary.accountPage.errors | null>(null);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  React.useEffect(() => {
    if (!settings) {
      return;
    }

    setLanguage(settings.language);
    setIconPack(settings.icon_pack);
  }, [settings]);

  const hasUnsavedSettings = settings !== null && (language !== settings.language || iconPack !== settings.icon_pack);

  const handleSettingsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasUnsavedSettings) {
      return;
    }

    setSettingsMessage(null);
    setSettingsError(null);
    setIsSavingSettings(true);

    try {
      await updateSettings({ language, icon_pack: iconPack });
      setSettingsMessage(dictionary.accountPage.settingsSaved);
    } catch {
      setSettingsError("generic");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (!oldPassword || !newPassword || !repeatPassword) {
      setPasswordError("required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("passwordTooShort");
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordError("passwordMismatch");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setPasswordMessage(dictionary.accountPage.passwordSaved);
    } catch (error) {
      setPasswordError(getPasswordErrorKey(error));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AppScaffold>
      <section className="app-page tasks-page">
        <section className="section-block section-block--compact">
          <p className="eyebrow">{dictionary.accountPage.eyebrow}</p>
          <h1 className="page-title">{dictionary.accountPage.title}</h1>
          <dl className="detail-grid">
            <div>
              <dt>{dictionary.accountPage.login}</dt>
              <dd>{user?.login ?? "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="section-block">
          <div className="section-block__header">
            <h2>{dictionary.accountPage.settingsTitle}</h2>
          </div>

          <form className="modal-form" onSubmit={handleSettingsSubmit}>
            <label>
              <span>{dictionary.accountPage.language}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
                <option value="ru">{dictionary.auth.ru}</option>
                <option value="en">{dictionary.auth.en}</option>
              </select>
            </label>

            <div className="field-label">
              <span>{dictionary.accountPage.iconPack}</span>
              <div className="icon-pack-grid">
                {ICON_PACK_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={`icon-pack-card${iconPack === option ? " icon-pack-card--active" : ""}`}
                    onClick={() => setIconPack(option)}
                    type="button"
                    aria-pressed={iconPack === option}
                  >
                    <div className="icon-pack-card__header">
                      <strong>
                        {option === "cookie_whip"
                          ? dictionary.accountPage.iconPackCookieWhip
                          : dictionary.accountPage.iconPackCarrotStick}
                      </strong>
                      {iconPack === option ? <span className="task-badge">{dictionary.accountPage.selected}</span> : null}
                    </div>
                    <span>{dictionary.accountPage.preview}</span>
                    <div className="icon-pack-card__preview">
                      <StatusIcon iconPack={option} status="reward" label={dictionary.tasksPage.rewardShort} />
                      <StatusIcon iconPack={option} status="punishment" label={dictionary.tasksPage.punishmentShort} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {settingsMessage ? <p className="form-note">{settingsMessage}</p> : null}
            {settingsError ? <p className="form-error">{dictionary.accountPage.errors[settingsError]}</p> : null}

            {hasUnsavedSettings ? (
              <button className="primary-button" disabled={isSavingSettings} type="submit">
                {dictionary.accountPage.saveSettings}
              </button>
            ) : null}
          </form>
        </section>

        <section className="section-block">
          <div className="section-block__header">
            <h2>{dictionary.accountPage.passwordTitle}</h2>
          </div>

          <form className="modal-form" onSubmit={handlePasswordSubmit}>
            <label>
              <span>{dictionary.accountPage.oldPassword}</span>
              <input
                autoComplete="current-password"
                maxLength={256}
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </label>

            <label>
              <span>{dictionary.accountPage.newPassword}</span>
              <input
                autoComplete="new-password"
                maxLength={256}
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>

            <label>
              <span>{dictionary.accountPage.repeatPassword}</span>
              <input
                autoComplete="new-password"
                maxLength={256}
                type="password"
                value={repeatPassword}
                onChange={(event) => setRepeatPassword(event.target.value)}
              />
            </label>

            {passwordMessage ? <p className="form-note">{passwordMessage}</p> : null}
            {passwordError ? <p className="form-error">{dictionary.accountPage.errors[passwordError]}</p> : null}

            <button className="primary-button" disabled={isChangingPassword} type="submit">
              {dictionary.accountPage.changePassword}
            </button>
          </form>
        </section>

        <section className="section-block section-block--compact">
          <div className="section-block__header">
            <h2>{dictionary.accountPage.sessionTitle}</h2>
          </div>
          <button className="secondary-button" onClick={() => void logout()} type="button">
            {dictionary.accountPage.logout}
          </button>
        </section>
      </section>
    </AppScaffold>
  );
}

