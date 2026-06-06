import accountIcon from "./account.svg";
import statsIcon from "./stats.svg";
import tasksIcon from "./tasks.svg";

export const NAVIGATION_ICONS = {
  tasks: tasksIcon,
  stats: statsIcon,
  account: accountIcon,
} as const;

export type NavigationIconName = keyof typeof NAVIGATION_ICONS;

