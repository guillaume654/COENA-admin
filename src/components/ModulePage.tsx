import { getServerDictionary } from "@/lib/i18n/server";
import type { ModuleKey } from "@/lib/i18n";
import { nav } from "@/lib/nav";
import { Button, EmptyTable, icons, PageHeader, StatGrid, Tabs } from "./ui";

/** Generic empty module screen: header, KPI tiles, tabs and an empty table. */
export async function ModulePage({ module, children }: { module: ModuleKey; children?: React.ReactNode }) {
  const { t } = await getServerDictionary();
  const m = t.modules[module];
  const icon = nav.flatMap((g) => g.items).find((i) => i.key === module)?.icon;

  return (
    <>
      <PageHeader title={m.title} description={m.description}>
        <Button icon={icons.Filter}>{t.common.filter}</Button>
        <Button icon={icons.Download}>{t.common.export}</Button>
        <Button variant="primary" icon={icons.Plus}>
          {m.action}
        </Button>
      </PageHeader>
      <StatGrid labels={m.stats} placeholder={t.app.noData} />
      <Tabs tabs={m.tabs} />
      <EmptyTable columns={m.columns} emptyTitle={m.emptyTitle} emptyBody={m.emptyBody} icon={icon} />
      {children}
    </>
  );
}
