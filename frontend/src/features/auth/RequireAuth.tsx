import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthContext";

export function RequireAuth() {
  const { user, isLoading, dictionary } = useAuth();

  if (isLoading) {
    return (
      <main className="auth-screen">
        <section className="auth-panel">{dictionary.app.loading}</section>
      </main>
    );
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

