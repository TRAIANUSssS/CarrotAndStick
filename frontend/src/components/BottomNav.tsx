import clsx from "clsx";
import { NavLink } from "react-router-dom";

import { NAVIGATION_ICONS } from "../assets/navigation";
import { useAuth } from "../features/auth/AuthContext";

const items = [
  { to: "/app/tasks", key: "tasks" },
  { to: "/app/stats", key: "stats" },
  { to: "/app/account", key: "account" },
] as const;

export function BottomNav() {
  const { dictionary } = useAuth();

  return (
    <nav className="bottom-nav" aria-label={dictionary.nav.ariaLabel}>
      {items.map((item) => {
        const icon = NAVIGATION_ICONS[item.key];
        return (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) => clsx("bottom-nav__item", isActive && "bottom-nav__item--active")}
            aria-label={dictionary.nav[item.key]}
          >
            <img src={icon} alt="" aria-hidden="true" />
            <span>{dictionary.nav[item.key]}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
