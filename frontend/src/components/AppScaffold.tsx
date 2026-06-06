import type { ReactNode } from "react";

import { BottomNav } from "./BottomNav";

type AppScaffoldProps = {
  children: ReactNode;
};

export function AppScaffold({ children }: AppScaffoldProps) {
  return (
    <main className="app-shell">
      <section className="mobile-frame mobile-frame--app">
        <div className="app-surface">{children}</div>
        <BottomNav />
      </section>
    </main>
  );
}
