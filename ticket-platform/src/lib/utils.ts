import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const DATE_LOCALES: Record<string, string> = {
  en: "en-US",
  rw: "rw-RW",
  fr: "fr-FR",
};

export function formatDate(date: string, locale: string = "en"): string {
  return new Date(date).toLocaleDateString(DATE_LOCALES[locale] ?? "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface DateParts {
  month: string;
  day: string;
  weekday: string;
}

function toDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
}

export function getDateParts(date: string, locale: string = "en"): DateParts | null {
  const parsed = toDate(date);
  if (Number.isNaN(parsed.getTime())) return null;

  const dateLocale = DATE_LOCALES[locale] ?? "en-US";

  return {
    month: parsed.toLocaleDateString(dateLocale, { month: "short" }).toUpperCase(),
    day: parsed.toLocaleDateString(dateLocale, { day: "numeric" }),
    weekday: parsed.toLocaleDateString(dateLocale, { weekday: "short" }),
  };
}

export function getShortDate(date: string, locale: string = "en"): string {
  const parsed = toDate(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(DATE_LOCALES[locale] ?? "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getMinPrice(
  ticketTypes: { price: number }[] | undefined,
  fallback?: number
): number | undefined {
  if (fallback !== undefined) return fallback;
  if (!ticketTypes || ticketTypes.length === 0) return undefined;
  return Math.min(...ticketTypes.map((ticket) => ticket.price));
}
