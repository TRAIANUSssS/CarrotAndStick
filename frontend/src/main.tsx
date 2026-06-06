import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import carrotReward from "./assets/iconpacks/carrot_stick/reward.svg";
import carrotPunishment from "./assets/iconpacks/carrot_stick/punishment.svg";
import cookieReward from "./assets/iconpacks/cookie_whip/reward.svg";
import cookiePunishment from "./assets/iconpacks/cookie_whip/punishment.svg";

const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
};

function App() {
  const [apiStatus, setApiStatus] = React.useState<"checking" | "ok" | "error">(
    "checking",
  );
  const apiBaseUrl = getApiBaseUrl();

  React.useEffect(() => {
    const controller = new AbortController();

    fetch(`${apiBaseUrl}/api/health`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => {
        setApiStatus(response.ok ? "ok" : "error");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiStatus("error");
        }
      });

    return () => controller.abort();
  }, [apiBaseUrl]);

  return (
    <main className="app-shell">
      <section className="mobile-frame" aria-labelledby="app-title">
        <div className="brand-icons" aria-hidden="true">
          <img src={cookieReward} alt="" />
          <img src={cookiePunishment} alt="" />
          <img src={carrotReward} alt="" />
          <img src={carrotPunishment} alt="" />
        </div>

        <h1 id="app-title">Carrot & Stick</h1>
        <p className="lead">Phase 1 bootstrap is running.</p>

        <dl className="status-list">
          <div>
            <dt>Frontend</dt>
            <dd>Vite + React</dd>
          </div>
          <div>
            <dt>Backend</dt>
            <dd data-state={apiStatus}>{apiStatus}</dd>
          </div>
          <div>
            <dt>API URL</dt>
            <dd>{apiBaseUrl}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
