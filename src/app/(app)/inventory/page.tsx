import { ModulePage } from "@/components/ModulePage";
import { Pager, type TabItem } from "@/components/ui";
import { getVenueWines, summarize, toRows } from "@/lib/data/wines";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getServerDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;
/** Tab value for wines without a cellar name. */
const NO_CELLAR = "__none";

function href(cave: string | undefined, page?: number) {
  const q = new URLSearchParams();
  if (cave) q.set("cave", cave);
  if (page && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/inventory?${s}` : "/inventory";
}

export default async function Page({ searchParams }: { searchParams: Promise<{ cave?: string; page?: string }> }) {
  const { locale, t } = await getServerDictionary();
  const params = await searchParams;
  const { wines, truncated, error } = await getVenueWines();

  // Cellar tabs from the venue's own data.
  const cellars = [...new Set(wines.map((w) => w.cellar).filter((c): c is string => !!c))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  const hasNoCellar = wines.some((w) => !w.cellar);
  const cave = params.cave && (params.cave === NO_CELLAR || cellars.includes(params.cave)) ? params.cave : undefined;

  const tabItems: TabItem[] | undefined =
    cellars.length > 0
      ? [
          { label: t.modules.inventory.tabs[0], href: href(undefined), active: !cave },
          ...cellars.map((c) => ({ label: c, href: href(c), active: cave === c })),
          ...(hasNoCellar ? [{ label: t.stock.noCellar, href: href(NO_CELLAR), active: cave === NO_CELLAR }] : []),
        ]
      : undefined;

  const shown = cave ? wines.filter((w) => (cave === NO_CELLAR ? !w.cellar : w.cellar === cave)) : wines;
  const allRows = shown.flatMap(toRows);
  const summary = summarize(shown, allRows);

  const pages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pages);
  const pageRows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const coef = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 });
  const rows = pageRows.map((r) => [
    r.name,
    r.appellation,
    r.region,
    r.vintage,
    t.stock.formats[r.format],
    [r.cellar, r.bin].filter(Boolean).join(" · ") || undefined,
    formatNumber(locale, r.stock),
    formatCurrency(locale, r.cost),
    formatCurrency(locale, r.price),
    r.price && r.cost ? coef.format(r.price / r.cost) : undefined,
  ]);

  const statValues =
    error || (wines.length === 0 && !tabItems)
      ? undefined
      : [
          formatNumber(locale, summary.wines),
          formatNumber(locale, summary.bottles),
          formatCurrency(locale, summary.value),
          formatNumber(locale, summary.outOfStock),
        ];

  const notice = error ? t.dataErrors[error] : truncated ? t.stock.truncated : undefined;
  const from = allRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, allRows.length);

  return (
    <ModulePage
      module="inventory"
      rows={rows}
      numeric={[3, 6, 7, 8, 9]}
      statValues={statValues}
      notice={notice}
      tabItems={tabItems}
      mutedFirst={false}
    >
      {allRows.length > PAGE_SIZE && (
        <Pager
          label={t.common.range
            .replace("{from}", formatNumber(locale, from) ?? "")
            .replace("{to}", formatNumber(locale, to) ?? "")
            .replace("{total}", formatNumber(locale, allRows.length) ?? "")}
          prevHref={page > 1 ? href(cave, page - 1) : undefined}
          nextHref={page < pages ? href(cave, page + 1) : undefined}
          prevLabel={t.common.previous}
          nextLabel={t.common.next}
        />
      )}
    </ModulePage>
  );
}
