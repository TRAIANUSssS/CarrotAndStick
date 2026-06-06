import { AppScaffold } from "../components/AppScaffold";
import { useAuth } from "../features/auth/AuthContext";

export function AppStatsPage() {
  const { dictionary } = useAuth();

  return (
    <AppScaffold>
      <section className="tasks-page">
        <section className="section-block section-block--placeholder">
          <p className="eyebrow">{dictionary.statsPage.eyebrow}</p>
          <h1 className="page-title">{dictionary.statsPage.title}</h1>
          <p>{dictionary.statsPage.placeholder}</p>
        </section>
      </section>
    </AppScaffold>
  );
}
