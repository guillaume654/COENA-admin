import { ModulePage } from "@/components/ModulePage";
import { formatLabel } from "@/lib/data/coena";
import { getSalesSummary, getTransactions } from "@/lib/data/transactions";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const locale = await getLocale();
  const [sales, summary] = await Promise.all([getTransactions({ salesOnly: true, limit: 100 }), getSalesSummary(7)]);

  const rows = sales.map((t) => [
    formatDateTime(locale, t.date),
    t.tableNumber || undefined, // 0 = no table recorded
    t.numberofPeopleatTable || undefined,
    t.wine.name,
    t.wine.cepage,
    t.wine.millesime,
    formatLabel(t),
    formatNumber(locale, t.quantity),
    formatCurrency(locale, t.unitPrice),
    formatCurrency(locale, t.totalPrice),
    formatNumber(locale, t.newStock),
  ]);

  const statValues = summary && [
    formatCurrency(locale, summary.revenue),
    formatNumber(locale, summary.bottles),
    formatNumber(locale, summary.glasses),
    formatCurrency(locale, summary.avgBottlePrice),
  ];

  return <ModulePage module="sales" rows={rows} numeric={[1, 2, 5, 7, 8, 9, 10]} statValues={statValues} />;
}
