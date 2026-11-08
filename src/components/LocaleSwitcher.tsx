"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import { LOCALE_COOKIE, locales, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();

  function choose(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div role="group" aria-label={label} className="flex rounded-md border border-border bg-surface p-0.5 text-xs">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={l === locale}
          className={clsx(
            "rounded px-2 py-1 font-medium uppercase",
            l === locale ? "bg-brand text-brand-foreground" : "text-muted hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
