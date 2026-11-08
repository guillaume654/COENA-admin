import { AppShell } from "@/components/AppShell";
import { getServerDictionary } from "@/lib/i18n/server";
import { dataSource } from "@/lib/data/transactions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getServerDictionary();
  return (
    <AppShell t={t} locale={locale} source={dataSource()}>
      {children}
    </AppShell>
  );
}
