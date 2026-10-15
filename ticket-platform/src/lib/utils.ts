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
