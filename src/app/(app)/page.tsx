import { ArrowLeftRight, Bell, CalendarClock, Receipt, Trophy } from "lucide-react";
import { EmptyState, Panel, PageHeader, StatGrid } from "@/components/ui";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const { t } = await getServerDictionary();
  const p = t.dashboard.panels;

  return (
    <>
      <PageHeader title={t.dashboard.title} description={t.dashboard.description} />
      <StatGrid labels={t.dashboard.kpis} placeholder={t.app.noData} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title={p.sales.title} action={t.common.viewAll}>
            <EmptyState title={t.app.comingSoon} body={p.sales.empty} icon={Receipt} />
          </Panel>
          <Panel title={p.movements.title} action={t.common.viewAll}>
            <EmptyState title={t.app.comingSoon} body={p.movements.empty} icon={ArrowLeftRight} />
          </Panel>
        </div>
        <div className="space-y-4">
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
