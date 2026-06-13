import type { StatsPeriod } from "../api/stats";

export function getLocalDateInputValue() {
  return formatDateValue(new Date());
}

export function clampToToday(value: string) {
  const today = getLocalDateInputValue();
  return value > today ? today : value;
}

export function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateValue(dateValue: Date) {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(dateValue: Date) {
  const result = new Date(dateValue);
  const weekday = result.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  result.setDate(result.getDate() + mondayOffset);
  return result;
}

export function getPeriodBounds(anchorDate: string, period: StatsPeriod) {
  if (period === "all_time") {
    return { startDate: null, endDate: null };
  }

  const dateValue = parseDateValue(anchorDate);

  if (period === "day") {
    return { startDate: anchorDate, endDate: anchorDate };
  }

  if (period === "week") {
    const start = getStartOfWeek(dateValue);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { startDate: formatDateValue(start), endDate: formatDateValue(end) };
  }

  if (period === "month") {
    return {
      startDate: formatDateValue(new Date(dateValue.getFullYear(), dateValue.getMonth(), 1)),
      endDate: formatDateValue(new Date(dateValue.getFullYear(), dateValue.getMonth() + 1, 0)),
    };
  }

  return {
    startDate: formatDateValue(new Date(dateValue.getFullYear(), 0, 1)),
    endDate: formatDateValue(new Date(dateValue.getFullYear(), 11, 31)),
  };
}

export function shiftAnchorDate(anchorDate: string, period: StatsPeriod, direction: -1 | 1) {
  const nextDate = parseDateValue(anchorDate);

  if (period === "day") {
    nextDate.setDate(nextDate.getDate() + direction);
  } else if (period === "week") {
    nextDate.setDate(nextDate.getDate() + direction * 7);
  } else if (period === "month") {
    const originalDay = nextDate.getDate();
    nextDate.setDate(1);
    nextDate.setMonth(nextDate.getMonth() + direction);
    const maxDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
    nextDate.setDate(Math.min(originalDay, maxDay));
  } else if (period === "year") {
    const originalMonth = nextDate.getMonth();
    const originalDay = nextDate.getDate();
    nextDate.setDate(1);
    nextDate.setFullYear(nextDate.getFullYear() + direction, originalMonth, 1);
    const maxDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
    nextDate.setDate(Math.min(originalDay, maxDay));
  }

  return formatDateValue(nextDate);
}

export function buildRecentDateRange(anchorDate: string, days: number) {
  const end = parseDateValue(anchorDate);
  return Array.from({ length: days }, (_, index) => {
    const current = new Date(end);
    current.setDate(end.getDate() - (days - index - 1));
    return formatDateValue(current);
  });
}

