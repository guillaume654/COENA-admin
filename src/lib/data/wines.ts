import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { backendGet, BackendError } from "@/lib/auth/backend";
import { requireSession } from "@/lib/auth/server";
import type { DataError } from "./transactions";
import { dataSource } from "./transactions";

/**
 * Wines of the active venue, read through the COENA backend (GET /wine, paginated, max 100 per page).
 *
 * Venue isolation is enforced here, not trusted to the backend (which returns every venue's
 * wines when the filter is missing): the venue comes from the session, `ownedByAccount` is always
 * sent, and any returned wine that belongs to another venue is dropped.
 */

/** Bottle sizes as stored on a wine: stock, list price and purchase price per size. */
export const FORMATS = [
  { key: "75cl", stock: "stock75cl", price: "prixbouteille75cl", cost: "prixachatbouteille75cl" },
  { key: "150cl", stock: "stock150cl", price: "prixbouteille150cl", cost: "prixachatbouteille150cl" },
  { key: "300cl", stock: "stock300cl", price: "prixbouteille300cl", cost: "prixachatbouteille300cl" },
  { key: "37.5cl", stock: "stock375cl", price: "prixdemibouteille375cl", cost: "prixachatdemibouteille375cl" },
  { key: "50cl", stock: "stock50cl", price: "prixdemibouteille50cl", cost: "prixachatdemibouteille50cl" },
] as const;

export type FormatKey = (typeof FORMATS)[number]["key"];

export type Wine = {
  id: string;
  name: string;
  appellation?: string;
  region?: string;
  country?: string;
  vintage?: number;
  cellar?: string;
  bin?: string;
  formats: { key: FormatKey; stock: number; price?: number; cost?: number }[];
};

/** One table row: one wine in one bottle size. */
export type StockRow = {
  wineId: string;
  name: string;
  appellation?: string;
  region?: string;
  vintage?: number;
  cellar?: string;
  bin?: string;
  format: FormatKey;
  stock: number;
  price?: number;
  cost?: number;
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export function fromWineDoc(doc: Record<string, unknown>): Wine {
  const millesime = num(doc.millesime);
  return {
    id: String(doc.id ?? doc._id ?? ""),
    name: str(doc.name) ?? "—",
    appellation: str(doc.cepage),
    region: str(doc.region),
    country: str(doc.pays),
    vintage: millesime && millesime > 0 ? millesime : undefined,
    cellar: str(doc.cellarName),
    bin: str(doc.bin),
    formats: FORMATS.map((f) => {
      const price = num(doc[f.price]);
      const cost = num(doc[f.cost]);
      return {
        key: f.key,
        stock: num(doc[f.stock]) ?? 0,
        price: price && price > 0 ? price : undefined,
        cost: cost && cost > 0 ? cost : undefined,
      };
    }),
  };
}

/** Sizes with stock or a list price; a wine with neither still shows one 75 cl row. */
export function toRows(wine: Wine): StockRow[] {
  const used = wine.formats.filter((f) => f.stock !== 0 || f.price !== undefined);
  const formats = used.length > 0 ? used : wine.formats.slice(0, 1);
  return formats.map((f) => ({
    wineId: wine.id,
    name: wine.name,
    appellation: wine.appellation,
    region: wine.region,
    vintage: wine.vintage,
    cellar: wine.cellar,
    bin: wine.bin,
    format: f.key,
    stock: f.stock,
    price: f.price,
    cost: f.cost,
  }));
}

export type StockSummary = {
  wines: number;
  bottles: number;
  /** Stock × purchase price, for rows with both. */
  value: number;
  /** Rows with a list price but no stock left. */
  outOfStock: number;
};

export function summarize(wines: Wine[], rows: StockRow[]): StockSummary {
  let bottles = 0;
  let value = 0;
  let outOfStock = 0;
  for (const r of rows) {
    if (r.stock > 0) {
      bottles += r.stock;
      if (r.cost) value += r.stock * r.cost;
    } else if (r.price) {
      outOfStock += 1;
    }
  }
  return { wines: wines.length, bottles, value, outOfStock };
}

const PAGE_SIZE = 100;
const MAX_PAGES = 50; // 5,000 wines
const PARALLEL = 5;

type WinePage = { page?: number; totalPages?: number; results?: unknown[] };

async function fetchPage(login: string, token: string, page: number): Promise<WinePage> {
  const q = new URLSearchParams({ ownedByAccount: login, page: String(page), limit: String(PAGE_SIZE) });
  return backendGet<WinePage>(`/wine?${q}`, token);
}

type VenueWines = { wines: Wine[]; truncated: boolean; error?: DataError };

/** All wines of a venue, every page. Cached per request. */
const loadVenueWines = cache(async (login: string, token: string): Promise<VenueWines> => {
  try {
    const first = await fetchPage(login, token, 1);
    const totalPages = Math.max(1, Number(first.totalPages) || 1);
    const last = Math.min(totalPages, MAX_PAGES);
    const pages: WinePage[] = [first];
    for (let start = 2; start <= last; start += PARALLEL) {
      const batch = [];
      for (let p = start; p < start + PARALLEL && p <= last; p++) batch.push(fetchPage(login, token, p));
      pages.push(...(await Promise.all(batch)));
    }
    const wines = pages
      .flatMap((p) => (Array.isArray(p.results) ? p.results : []))
      .filter((w): w is Record<string, unknown> => !!w && typeof w === "object")
      .filter((w) => w.ownedByAccount === login)
      .map(fromWineDoc)
      .sort((a, b) => a.name.localeCompare(b.name, "fr") || (a.vintage ?? 0) - (b.vintage ?? 0));
    return { wines, truncated: totalPages > MAX_PAGES };
  } catch (e) {
    if (e instanceof BackendError && e.status === 401) redirect("/login?expired=1");
    console.error(`Wines for ${login} failed:`, e instanceof Error ? e.message : e);
    const status = e instanceof BackendError ? e.status : 0;
    return { wines: [], truncated: false, error: status === 504 ? "slow" : "unavailable" };
  }
});

const DEMO_WINES: Wine[] = [
  {
    id: "demo-1",
    name: "Rully 1er Cru \"La Bressande\" - Château de Rully",
    appellation: "Côte Chalonnaise",
    region: "Bourgogne",
    country: "France",
    vintage: 2017,
    cellar: "Service",
    formats: FORMATS.map((f) =>
      f.key === "75cl" ? { key: f.key, stock: 6, price: 81, cost: 19 } : { key: f.key, stock: 0 },
    ),
  },
];

export async function getVenueWines(): Promise<VenueWines> {
  const source = dataSource();
  if (source === "none") return { wines: [], truncated: false };
  if (source === "demo") return { wines: DEMO_WINES, truncated: false };
  const session = await requireSession();
  return loadVenueWines(session.activeLogin, session.accessToken);
}
