import { AppScaffold } from "../components/AppScaffold";
import { useAuth } from "../features/auth/AuthContext";

export function AppAccountPage() {
  const { dictionary, logout, settings, user } = useAuth();

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
            <div>
              <dt>{dictionary.accountPage.language}</dt>
              <dd>{settings?.language ?? "—"}</dd>
            </div>
            <div>
              <dt>{dictionary.accountPage.iconPack}</dt>
              <dd>{settings?.icon_pack ?? "—"}</dd>
            </div>
          </dl>
          <p className="muted-copy">{dictionary.accountPage.placeholder}</p>
          <button className="secondary-button" onClick={() => void logout()} type="button">
            {dictionary.accountPage.logout}
          </button>
        </section>
      </section>
    </AppScaffold>
  );
}
