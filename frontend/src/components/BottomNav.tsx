import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

import { NAVIGATION_ICONS } from "../assets/navigation";
import { useAuth } from "../features/auth/AuthContext";

const items = [
  { to: "/app/tasks", key: "tasks" },
  { to: "/app/stats", key: "stats" },
  { to: "/app/account", key: "account" },
] as const;

export function BottomNav() {
  const { dictionary } = useAuth();
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label={dictionary.nav.ariaLabel}>
      {items.map((item) => {
        const icon = NAVIGATION_ICONS[item.key];
        const isActive =
          item.key === "tasks" ? location.pathname.startsWith("/app/tasks") : location.pathname === item.to;

        return (
          <Link
            key={item.key}
            to={item.to}
            className={clsx("bottom-nav__item", isActive && "bottom-nav__item--active")}
            aria-label={dictionary.nav[item.key]}
            aria-current={isActive ? "page" : undefined}
          >
            <img src={icon} alt="" aria-hidden="true" />
            <span className="sr-only">{dictionary.nav[item.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
