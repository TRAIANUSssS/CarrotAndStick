export function formatCompactNumber(language: string, value: number) {
  if (Math.abs(value) < 1000) {
    return new Intl.NumberFormat(language, {
      maximumFractionDigits: 0,
    }).format(value);
  }

  const units =
    language === "ru"
      ? [
          { value: 1_000_000_000, suffix: "Млрд" },
          { value: 1_000_000, suffix: "М" },
          { value: 1_000, suffix: "К" },
        ]
      : [
          { value: 1_000_000_000, suffix: "B" },
          { value: 1_000_000, suffix: "M" },
          { value: 1_000, suffix: "K" },
        ];

  const unit = units.find((item) => Math.abs(value) >= item.value);
  if (!unit) {
    return String(value);
  }

  const scaled = value / unit.value;
  const decimals = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : 2;
  const rounded = Number(scaled.toFixed(decimals));
  const minimumFractionDigits = decimals > 0 && Number.isInteger(rounded) ? 1 : 0;
  const maximumFractionDigits = decimals;

  return `${new Intl.NumberFormat(language, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(rounded)}${unit.suffix}`;
}

export function formatCalendarDate(language: string, value: string) {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatDateLabel(language: string, value: string | null) {
  if (value === null) {
    return "-";
  }

  return formatCalendarDate(language, value);
}

export function formatTimestamp(language: string, value: string | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

