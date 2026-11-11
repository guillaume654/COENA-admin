import { AppShell } from "@/components/AppShell";
import type { ShellUser } from "@/components/AccountMenu";
import { authMode } from "@/lib/auth/config";
import { requireSession } from "@/lib/auth/server";
import { isAdmin } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { dataSource } from "@/lib/data/transactions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getServerDictionary();
  const session = await requireSession();

  // Only what the header needs: never pass tokens to the browser.
  const user: ShellUser = {
    login: session.login,
    name: session.name,
    activeLogin: session.activeLogin,
    activeName: session.activeName,
    linkedAccounts: session.linkedAccounts,
    isAdmin: isAdmin(session),
    demo: authMode() === "demo",
  };

  return (
    <AppShell t={t} locale={locale} source={dataSource()} user={user}>
      {children}
    </AppShell>
  );
}
