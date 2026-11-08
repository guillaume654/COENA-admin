import { ArrowLeftRight, Bell, CalendarClock, Receipt, Trophy } from "lucide-react";
import { EmptyState, Panel, PageHeader, StatGrid } from "@/components/ui";
import { getServerDictionary } from "@/lib/i18n/server";
import { formatLabel } from "@/lib/data/coena";
import { getSalesSummary, getTransactions } from "@/lib/data/transactions";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { t, locale } = await getServerDictionary();
  const p = t.dashboard.panels;
  const [latest, summary] = await Promise.all([getTransactions({ salesOnly: true, limit: 5 }), getSalesSummary(7)]);

  // Only "Sales (7 days)" (index 3) comes from wine-list transactions today.
  const kpiValues = [undefined, undefined, undefined, formatCurrency(locale, summary?.revenue)];

  return (
    <>
      <PageHeader title={t.dashboard.title} description={t.dashboard.description} />
      <StatGrid labels={t.dashboard.kpis} values={kpiValues} placeholder={t.app.noData} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <Panel title={p.sales.title} action={t.common.viewAll}>
            {latest.length === 0 ? (
              <EmptyState title={t.app.comingSoon} body={p.sales.empty} icon={Receipt} />
            ) : (
              <ul className="divide-y divide-border">
                {latest.map((s) => (
                  <li key={s.id} className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {s.wine.name} {s.wine.millesime}
                      </div>
                      <div className="text-xs text-muted">
                        {formatDateTime(locale, s.date)} · {s.quantity} × {formatLabel(s)}
                      </div>
                    </div>
                    <div className="shrink-0 font-medium">{formatCurrency(locale, s.totalPrice)}</div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title={p.movements.title} action={t.common.viewAll}>
            <EmptyState title={t.app.comingSoon} body={p.movements.empty} icon={ArrowLeftRight} />
          </Panel>
        </div>
        <div className="min-w-0 space-y-4">
          <Panel title={p.alerts.title}>
            <EmptyState title={t.app.comingSoon} body={p.alerts.empty} icon={Bell} />
          </Panel>
          <Panel title={p.topWines.title}>
            <EmptyState title={t.app.comingSoon} body={p.topWines.empty} icon={Trophy} />
          </Panel>
          <Panel title={p.windows.title}>
            <EmptyState title={t.app.comingSoon} body={p.windows.empty} icon={CalendarClock} />
          </Panel>
        </div>
      </div>
    </>
  );
}
