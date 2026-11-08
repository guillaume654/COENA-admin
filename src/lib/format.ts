import type { Locale } from "./i18n";

const tag = (locale: Locale) => (locale === "fr" ? "fr-FR" : "en-GB");

export function formatCurrency(locale: Locale, value: number | undefined) {
  if (value === undefined) return undefined;
  return new Intl.NumberFormat(tag(locale), { style: "currency", currency: "EUR" }).format(value);
}

export function formatNumber(locale: Locale, value: number | undefined) {
  if (value === undefined) return undefined;
  return new Intl.NumberFormat(tag(locale)).format(value);
}

export function formatSigned(locale: Locale, value: number | undefined) {
  if (value === undefined) return undefined;
  return new Intl.NumberFormat(tag(locale), { signDisplay: "exceptZero" }).format(value);
}

/** Dates are shown in the venue's time zone (Paris by default). */
export function formatDateTime(locale: Locale, date: Date) {
  return new Intl.DateTimeFormat(tag(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: process.env.COENA_TIMEZONE || "Europe/Paris",
  }).format(date);
}
