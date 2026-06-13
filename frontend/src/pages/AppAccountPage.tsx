import React from "react";

import carrotPunishmentIcon from "../assets/iconpacks/carrot_stick/punishment.svg";
import carrotRewardIcon from "../assets/iconpacks/carrot_stick/reward.svg";
import cookiePunishmentIcon from "../assets/iconpacks/cookie_whip/punishment.svg";
import cookieRewardIcon from "../assets/iconpacks/cookie_whip/reward.svg";
import { authApi, type IconPackId, type Language } from "../api/auth";
import { AppScaffold } from "../components/AppScaffold";
import { useAuth } from "../features/auth/AuthContext";

const iconPackPreview: Record<IconPackId, { reward: string; punishment: string }> = {
  carrot_stick: {
    reward: carrotRewardIcon,
    punishment: carrotPunishmentIcon,
  },
  cookie_whip: {
    reward: cookieRewardIcon,
    punishment: cookiePunishmentIcon,
  },
};

export function AppAccountPage() {
  const { dictionary, logout, settings, updateSettings, user } = useAuth();
  const [language, setLanguage] = React.useState<Language>("ru");
  const [iconPack, setIconPack] = React.useState<IconPackId>("cookie_whip");
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

  const handleSettingsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

    if (!newPassword || !repeatPassword) {
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
      await authApi.changePassword({ new_password: newPassword });
      setNewPassword("");
      setRepeatPassword("");
      setPasswordMessage(dictionary.accountPage.passwordSaved);
    } catch {
      setPasswordError("generic");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AppScaffold>
      <section className="tasks-page">
        <section className="section-block">
          <p className="eyebrow">{dictionary.accountPage.eyebrow}</p>
          <h1 className="page-title">{dictionary.accountPage.title}</h1>
          <dl className="detail-grid">
            <div>
              <dt>{dictionary.accountPage.login}</dt>
              <dd>{user?.login ?? "—"}</dd>
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
                {(["cookie_whip", "carrot_stick"] as IconPackId[]).map((option) => (
                  <button
                    key={option}
                    className={`icon-pack-card${iconPack === option ? " icon-pack-card--active" : ""}`}
                    onClick={() => setIconPack(option)}
                    type="button"
                    aria-pressed={iconPack === option}
                  >
                    <strong>
                      {option === "cookie_whip"
                        ? dictionary.accountPage.iconPackCookieWhip
                        : dictionary.accountPage.iconPackCarrotStick}
                    </strong>
                    <span>{dictionary.accountPage.preview}</span>
                    <div className="icon-pack-card__preview">
                      <img alt={dictionary.tasksPage.reward} src={iconPackPreview[option].reward} />
                      <img alt={dictionary.tasksPage.punishment} src={iconPackPreview[option].punishment} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {settingsMessage ? <p className="form-note">{settingsMessage}</p> : null}
            {settingsError ? <p className="form-error">{dictionary.accountPage.errors[settingsError]}</p> : null}

            <button className="primary-button" disabled={isSavingSettings} type="submit">
              {dictionary.accountPage.saveSettings}
            </button>
          </form>
        </section>

        <section className="section-block">
          <div className="section-block__header">
            <h2>{dictionary.accountPage.passwordTitle}</h2>
          </div>

          <form className="modal-form" onSubmit={handlePasswordSubmit}>
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

        <section className="section-block">
          <button className="secondary-button" onClick={() => void logout()} type="button">
            {dictionary.accountPage.logout}
          </button>
        </section>
      </section>
    </AppScaffold>
  );
}
