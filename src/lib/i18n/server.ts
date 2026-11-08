import { cookies } from "next/headers";
import { defaultLocale, getDictionary, isLocale, LOCALE_COOKIE, type Locale } from "./index";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getServerDictionary() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
