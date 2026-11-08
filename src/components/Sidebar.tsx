"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Wine } from "lucide-react";
import { nav, navLabel } from "@/lib/nav";
import type { Dictionary } from "@/lib/i18n";

export function Sidebar({ t, onNavigate }: { t: Dictionary; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        {/* Placeholder mark — replace with the COENA logo */}
        <span className="grid size-9 place-items-center rounded-lg bg-brand text-brand-foreground">
          <Wine className="size-5" aria-hidden />
        </span>
        <div className="leading-tight">
          <div className="font-serif text-lg">{t.app.name}</div>
          <div className="text-xs text-sidebar-muted">{t.app.tagline}</div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {nav.map((group) => (
          <div key={group.group}>
            <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
              {t.groups[group.group]}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-active text-white"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-active/60 hover:text-white",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {navLabel(t, item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-sidebar-muted">{t.app.synced}</div>
    </nav>
  );
}
