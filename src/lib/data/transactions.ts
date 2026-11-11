import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authMode } from "@/lib/auth/config";
import { backendGet, BackendError } from "@/lib/auth/backend";
import { requireSession } from "@/lib/auth/server";
import {
  fromDocument,
  isSale,
  summarizeSales,
  type CoenaTransaction,
  type DataSource,
  type SalesGroup,
  type SalesSummary,
} from "./coena";
import { demoTransactions } from "./fixtures";

/**
 * Wine list transactions, read through the COENA backend (GET /transaction).
 *
 * Venue isolation is enforced here, not trusted to the backend:
 * - the venue always comes from the encrypted session (never from the browser),
 * - the `iCloudAccountName` filter is always sent,
 * - any returned row that belongs to another venue is dropped.
 */
export function dataSource(): DataSource {
  const mode = authMode();
  return mode === "backend" ? "api" : mode === "demo" ? "demo" : "none";
}

/** All transactions of the active venue. The backend has no paging or date filter yet. Cached per request. */
const loadVenueTransactions = cache(async (login: string, accessToken: string): Promise<CoenaTransaction[]> => {
  let rows: unknown;
  try {
    rows = await backendGet<unknown>(`/transaction?iCloudAccountName=${encodeURIComponent(login)}`, accessToken);
  } catch (e) {
    if (e instanceof BackendError && e.status === 401) redirect("/login?expired=1");
    throw e;
  }
  if (!Array.isArray(rows)) throw new BackendError("Unexpected /transaction response", 502);
  return rows
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .filter((r) => r.iCloudAccountName === login)
    .map((r) => fromDocument(r))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
});

async function venueTransactions(): Promise<CoenaTransaction[]> {
  if (dataSource() === "demo") return demoTransactions;
  const session = await requireSession();
  return loadVenueTransactions(session.activeLogin, session.accessToken);
}

export async function getTransactions({
  limit = 50,
  salesOnly = false,
}: { limit?: number; salesOnly?: boolean } = {}): Promise<CoenaTransaction[]> {
  if (dataSource() === "none") return [];
  const all = await venueTransactions();
  return all.filter((t) => !salesOnly || isSale(t)).slice(0, limit);
}

/** Sales over the last `days` days, grouped by container (bottle / glass). */
export async function getSalesSummary(days = 7): Promise<SalesSummary | undefined> {
  const source = dataSource();
  if (source === "none") return undefined;

  // Demo data dates from 2019, so the time window is ignored there.
  const since = source === "demo" ? 0 : Date.now() - days * 24 * 60 * 60 * 1000;
  const groups = new Map<string, SalesGroup>();
  for (const t of await venueTransactions()) {
    if (!isSale(t) || t.date.getTime() < since) continue;
    const key = t.containerType ?? "";
    const g = groups.get(key) ?? { containerType: t.containerType, quantity: 0, revenue: 0 };
    g.quantity += t.quantity;
    g.revenue += t.totalPrice ?? 0;
    groups.set(key, g);
  }
  return summarizeSales([...groups.values()]);
}
