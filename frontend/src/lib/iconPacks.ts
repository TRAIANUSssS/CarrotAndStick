import carrotPunishmentIcon from "../assets/iconpacks/carrot_stick/punishment.svg";
import carrotRewardIcon from "../assets/iconpacks/carrot_stick/reward.svg";
import cookiePunishmentIcon from "../assets/iconpacks/cookie_whip/punishment.svg";
import cookieRewardIcon from "../assets/iconpacks/cookie_whip/reward.svg";
import type { IconPackId } from "../api/auth";

export const ICON_PACK_OPTIONS: IconPackId[] = ["cookie_whip", "carrot_stick"];

export const ICON_PACKS: Record<IconPackId, { reward: string; punishment: string }> = {
  cookie_whip: {
    reward: cookieRewardIcon,
    punishment: cookiePunishmentIcon,
  },
  carrot_stick: {
    reward: carrotRewardIcon,
    punishment: carrotPunishmentIcon,
  },
};

