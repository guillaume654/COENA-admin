"use client";

import { useState } from "react";
import { Building2, Menu, Search, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { DataSource } from "@/lib/data/coena";

export function AppShell({
  t,
  locale,
  source,
  children,
}: {
  t: Dictionary;
  locale: Locale;
  source: DataSource;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar t={t} source={source} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">
            <Sidebar t={t} source={source} onNavigate={() => setOpen(false)} />
          </aside>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-md bg-surface p-2 text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.app.menu}
          className="rounded-md p-2 text-muted hover:bg-surface-muted lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-muted sm:flex">
          <Building2 className="size-4" aria-hidden />
          {t.app.venuePlaceholder}
        </div>

        <label className="relative ml-auto flex max-w-sm flex-1 items-center sm:ml-2">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted" aria-hidden />
          <input
            type="search"
            placeholder={t.app.search}
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-brand"
          />
        </label>

        <div className="ml-auto flex items-center gap-3">
          <LocaleSwitcher locale={locale} label={t.app.language} />
          <span className="grid size-8 place-items-center rounded-full bg-surface-muted text-xs font-medium text-muted">
            —
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}
