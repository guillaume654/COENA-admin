"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Spinner } from "./ui";

/**
 * Shows a spinner over the content area from the moment the user clicks an internal link or
 * submits a form (venue switch, filters) until the new page is on screen. Some backend calls take
 * several seconds; without this, the page would look frozen.
 */
export function NavigationProgress({ label, resetKey }: { label: string; resetKey?: string }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const url = `${pathname}?${search.toString()}`;

  // Done as soon as the URL (or the active venue) changes.
  useEffect(() => setBusy(false), [url, resetKey]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#")) return;
      const next = new URL(a.href, window.location.href);
      if (next.origin !== window.location.origin) return;
      if (next.pathname + next.search === window.location.pathname + window.location.search) return;
      setBusy(true);
    };
    const onSubmit = () => setBusy(true);
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
    };
  }, []);

  // Never stay stuck: give up after 60 s.
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => setBusy(false), 60_000);
    return () => clearTimeout(timer);
  }, [busy]);

  if (!busy) return null;
  return (
    <div className="coena-delayed-fade fixed inset-x-0 bottom-0 top-16 z-20 flex items-center justify-center bg-background/70 backdrop-blur-[1px] lg:left-64">
      <Spinner label={label} />
    </div>
  );
}
