import { useAuth } from "../features/auth/AuthContext";

export function AppTasksPage() {
  const { user, settings, dictionary, logout } = useAuth();

  return (
    <main className="app-shell">
      <section className="mobile-frame app-page" aria-labelledby="tasks-title">
        <header className="page-header">
          <h1 id="tasks-title">{dictionary.appPages.tasksTitle}</h1>
          <p>{dictionary.appPages.tasksSubtitle}</p>
        </header>

        <dl className="status-list">
          <div>
            <dt>{dictionary.appPages.currentUser}</dt>
            <dd>{user?.login}</dd>
          </div>
          <div>
            <dt>{dictionary.appPages.language}</dt>
            <dd>{settings?.language}</dd>
          </div>
          <div>
            <dt>{dictionary.appPages.iconPack}</dt>
            <dd>{settings?.icon_pack}</dd>
          </div>
        </dl>

        <button className="secondary-button" onClick={() => void logout()} type="button">
          {dictionary.appPages.logout}
        </button>
      </section>
    </main>
  );
}

