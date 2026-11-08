import fr from "./fr";
import en from "./en";

export type Dictionary = typeof fr;
export type ModuleKey = keyof Dictionary["modules"];

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
export const LOCALE_COOKIE = "coena-locale";

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
