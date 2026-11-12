import { ModulePage } from "@/components/ModulePage";
import { formatLabel, stockDelta } from "@/lib/data/coena";
import { getTransactions } from "@/lib/data/transactions";
import { formatDateTime, formatNumber, formatSigned } from "@/lib/format";
import { getServerDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { locale, t } = await getServerDictionary();
  const { items: movements, error } = await getTransactions({ limit: 100 });

  const rows = movements.map((t) => [
    formatDateTime(locale, t.date),
    t.reason ?? `#${t.transactionType}`,
    t.wine.name,
    t.wine.millesime,
    formatLabel(t),
    formatSigned(locale, stockDelta(t)),
    formatNumber(locale, t.currentStock),
    formatNumber(locale, t.newStock),
  ]);

  return <ModulePage module="movements" rows={rows} numeric={[3, 5, 6, 7]} notice={error && t.dataErrors[error]} />;
}
