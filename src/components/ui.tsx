import clsx from "clsx";
import { Download, Filter, Inbox, Plus, Upload, type LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Button({
  children,
  variant = "secondary",
  icon: Icon,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        variant === "primary"
          ? "bg-brand text-brand-foreground hover:opacity-90"
          : "border border-border bg-surface text-foreground hover:bg-surface-muted",
      )}
    >
      {Icon && <Icon className="size-4" aria-hidden />}
      {children}
    </button>
  );
}

export const icons = { Plus, Filter, Download, Upload };

export function StatGrid({ labels, placeholder }: { labels: string[]; placeholder: string }) {
  if (labels.length === 0) return null;
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
      {labels.map((label) => (
        <div key={label} className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted">{label}</div>
          <div className="mt-2 font-serif text-2xl text-foreground/40">{placeholder}</div>
        </div>
      ))}
    </div>
  );
}

export function Tabs({ tabs }: { tabs: string[] }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={i === 0}
          className={clsx(
            "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm",
            i === 0 ? "border-brand font-medium text-foreground" : "border-transparent text-muted hover:text-foreground",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, icon: Icon = Inbox }: { title: string; body: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="mt-4 font-medium text-foreground">{title}</div>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
    </div>
  );
}

/** Table with headers only; rows will come from MongoDB later. */
export function EmptyTable({
  columns,
  emptyTitle,
  emptyBody,
  icon,
}: {
  columns: string[];
  emptyTitle: string;
  emptyBody: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted">
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody />
        </table>
      </div>
      {/* Outside the scroll area so it stays centred on narrow screens */}
      <EmptyState title={emptyTitle} body={emptyBody} icon={icon} />
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {action && <span className="text-xs text-muted">{action}</span>}
      </header>
      {children}
    </section>
  );
}
