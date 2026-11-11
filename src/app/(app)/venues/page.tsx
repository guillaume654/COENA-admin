import { notFound, redirect } from "next/navigation";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { switchVenueAction } from "@/app/actions/auth";
import { authMode } from "@/lib/auth/config";
import { backendGet, BackendError } from "@/lib/auth/backend";
import { requireSession } from "@/lib/auth/server";
import { isAdmin } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type ListedAccount = { login: string; name?: string };

/** Admin-only list of all COENA accounts (GET /account/list). Access is checked here, not only in the backend. */
export default async function VenuesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  if (authMode() !== "backend") notFound();
  const session = await requireSession();
  if (!isAdmin(session)) notFound();

  const { t } = await getServerDictionary();
  const q = ((await searchParams).q ?? "").trim().toLowerCase();

  let raw: unknown;
  try {
    raw = await backendGet<unknown>("/account/list", session.accessToken);
  } catch (e) {
    if (e instanceof BackendError && e.status === 401) redirect("/login?expired=1");
    throw e;
  }

  const accounts: ListedAccount[] = (Array.isArray(raw) ? raw : [])
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object" && typeof a.login === "string")
    .map((a) => ({ login: a.login as string, name: typeof a.name === "string" && a.name ? a.name : undefined }))
    .filter((a) => !q || a.login.toLowerCase().includes(q) || a.name?.toLowerCase().includes(q))
    .sort((a, b) => (a.name ?? a.login).localeCompare(b.name ?? b.login, "fr"));

  return (
    <>
      <PageHeader title={t.venues.title} description={t.venues.description} />
      <form className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t.venues.search}
          className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
        />
      </form>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {accounts.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">{t.venues.empty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {accounts.map((a) => (
              <li key={a.login} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{a.name ?? a.login}</div>
                  <div className="truncate text-xs text-muted">{a.login}</div>
                </div>
                {a.login === session.activeLogin ? (
                  <span className="shrink-0 text-xs text-muted">{t.venues.current}</span>
                ) : (
                  <form action={switchVenueAction} className="shrink-0">
                    <input type="hidden" name="login" value={a.login} />
                    <input type="hidden" name="name" value={a.name ?? ""} />
                    <input type="hidden" name="redirect" value="home" />
                    <button
                      type="submit"
                      className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
                    >
                      {t.venues.open}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
