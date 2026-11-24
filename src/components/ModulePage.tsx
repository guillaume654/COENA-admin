import { getServerDictionary } from "@/lib/i18n/server";
import type { ModuleKey } from "@/lib/i18n";
import { nav } from "@/lib/nav";
import { Button, DataNotice, DataTable, icons, PageHeader, StatGrid, Tabs, type Cell, type TabItem } from "./ui";

/** Module screen: header, KPI tiles, tabs and a table (empty until data is passed in). */
export async function ModulePage({
  module,
  rows,
  numeric,
  statValues,
  notice,
  tabItems,
  beforeTable,
  mutedFirst,
  children,
}: {
  module: ModuleKey;
  rows?: Cell[][];
  numeric?: number[];
  statValues?: (string | undefined)[];
  /** Shown above the page when its data couldn't be loaded. */
  notice?: string;
  /** Tabs as links (real filters) instead of the dictionary's static labels. */
  tabItems?: TabItem[];
  mutedFirst?: boolean;
  /** Extra filters shown between the tabs and the table. */
  beforeTable?: React.ReactNode;
  children?: React.ReactNode;
}) {
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
      <DataNotice message={notice} />
      <StatGrid labels={m.stats} values={statValues} placeholder={t.app.noData} />
      <Tabs tabs={m.tabs} items={tabItems} />
      {beforeTable}
      <DataTable
        columns={m.columns}
        rows={rows}
        numeric={numeric}
        mutedFirst={mutedFirst}
        emptyTitle={m.emptyTitle}
        emptyBody={m.emptyBody}
        icon={icon}
      />
      {children}
    </>
  );
}
