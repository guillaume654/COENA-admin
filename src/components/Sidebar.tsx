"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { nav, navLabel } from "@/lib/nav";
import type { Dictionary } from "@/lib/i18n";
import type { DataSource } from "@/lib/data/coena";

export function Sidebar({ t, source, onNavigate }: { t: Dictionary; source: DataSource; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 pb-5 pt-6">
        <Image src="/brand/coena-logo-white.png" alt="COENA" width={2369} height={659} priority className="h-8 w-auto" />
        <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-sidebar-muted">{t.app.tagline}</div>
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
                          : "text-sidebar-foreground/75 hover:bg-white/10 hover:text-white",
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

      <div className="flex items-center gap-2 border-t border-white/10 px-5 py-4 text-xs text-sidebar-muted">
        <span
          aria-hidden
          className={clsx("size-2 rounded-full", source === "mongodb" ? "bg-emerald-500" : source === "demo" ? "bg-amber-400" : "bg-sidebar-muted/50")}
        />
        {source === "mongodb" ? t.app.syncOn : source === "demo" ? t.app.syncDemo : t.app.syncOff}
      </div>
    </nav>
  );
}
