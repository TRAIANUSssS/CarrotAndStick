import clsx from "clsx";

import type { IconPackId } from "../api/auth";
import { ICON_PACKS } from "../lib/iconPacks";

type StatusIconProps = {
  iconPack: IconPackId;
  status: "reward" | "punishment";
  label?: string;
  className?: string;
};

export function StatusIcon({ iconPack, status, label, className }: StatusIconProps) {
  const source = ICON_PACKS[iconPack][status];

  return <img className={clsx("status-icon", className)} src={source} alt={label ?? ""} aria-hidden={label ? undefined : true} />;
}

