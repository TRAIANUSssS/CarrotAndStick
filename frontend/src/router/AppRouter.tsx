import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthForm } from "../features/auth/AuthForm";
import { RequireAuth } from "../features/auth/RequireAuth";
import { AppAccountPage } from "../pages/AppAccountPage";
import { ArchivedTasksPage } from "../pages/ArchivedTasksPage";
import { AppStatsPage } from "../pages/AppStatsPage";
import { AppTasksPage } from "../pages/AppTasksPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app/tasks" replace />} />
        <Route path="/login" element={<AuthForm mode="login" />} />
        <Route path="/register" element={<AuthForm mode="register" />} />
        <Route path="/app" element={<RequireAuth />}>
          <Route index element={<Navigate to="/app/tasks" replace />} />
          <Route path="tasks" element={<AppTasksPage />} />
          <Route path="tasks/archived" element={<ArchivedTasksPage />} />
          <Route path="stats" element={<AppStatsPage />} />
          <Route path="account" element={<AppAccountPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/app/tasks" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
