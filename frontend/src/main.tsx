import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import { AuthProvider } from "./features/auth/AuthContext";
import { AppRouter } from "./router/AppRouter";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>,
);
