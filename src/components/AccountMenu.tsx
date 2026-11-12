"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Building2, Check, ChevronDown, LogOut, Store } from "lucide-react";
import { logoutAction, switchVenueAction } from "@/app/actions/auth";
import type { Dictionary } from "@/lib/i18n";

export type ShellUser = {
  login: string;
  name?: string;
  activeLogin: string;
  activeName?: string;
  linkedAccounts: string[];
  isSuperAdmin: boolean;
  /** Demo mode: no real account, no menu actions. */
  demo?: boolean;
};

export function AccountMenu({ user, t }: { user: ShellUser; t: Dictionary["auth"] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close once the switch has gone through (closing on click would remove the form before it submits).
  useEffect(() => setOpen(false), [user.activeLogin]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const activeLabel = user.activeLogin === user.login ? user.name || user.login : user.activeName || user.activeLogin;
  const options = [
    { login: user.login, label: user.name || user.login, group: t.myVenue },
    ...user.linkedAccounts.filter((l) => l !== user.login).map((l) => ({ login: l, label: l, group: t.linked })),
  ];

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={user.demo}
        className="flex max-w-[14rem] items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-muted disabled:cursor-default disabled:hover:bg-surface"
      >
        <Building2 className="size-4 shrink-0 text-muted" aria-hidden />
        <span className="truncate font-medium">{activeLabel}</span>
        {!user.demo && <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <div className="text-xs text-muted">{t.signedInAs}</div>
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{user.name || user.login}</span>
              {user.isSuperAdmin && (
                <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium uppercase text-brand-foreground">
                  {t.superAdmin}
                </span>
              )}
            </div>
            <div className="truncate text-xs text-muted">{user.login}</div>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            <div className="px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted">
              {t.switchVenue}
            </div>
            {options.map((o) => (
              <form key={o.login} action={switchVenueAction}>
                <input type="hidden" name="login" value={o.login} />
                <button
                  type="submit"
                  role="menuitem"
                  className={clsx(
                    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-surface-muted",
                    o.login === user.activeLogin && "font-medium",
                  )}
                >
                  <Store className="size-4 shrink-0 text-muted" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {o.login === user.activeLogin && <Check className="size-4 shrink-0 text-brand-fine" aria-label="✓" />}
                </button>
              </form>
            ))}
            {user.isSuperAdmin && (
              <Link
                href="/venues"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-brand-fine hover:bg-surface-muted"
              >
                {t.allVenues}
              </Link>
            )}
          </div>

          <form action={logoutAction} className="border-t border-border">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
            >
              <LogOut className="size-4 text-muted" aria-hidden />
              {t.logout}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
