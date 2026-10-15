const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export function parseEventDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const text = value.trim();
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]) - 1;
    const day = Number(iso[3]);
    if (month >= 0 && month < 12) return new Date(year, month, day);
  }

  const named = text.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (named) {
    const key = named[1].toLowerCase().slice(0, 3);
    const monthIndex = MONTH_NAMES.findIndex((m) => m.slice(0, 3) === key);
    if (monthIndex >= 0) {
      return new Date(Number(named[3]), monthIndex, Number(named[2]));
    }
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isPastEvent(value: string | null | undefined): boolean {
  const parsed = parseEventDate(value);
  if (!parsed) return false;
  const eventDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  return eventDay.getTime() < startOfToday().getTime();
}
