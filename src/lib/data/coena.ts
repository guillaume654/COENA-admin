/**
 * Shape of documents in `DigitalMenu-Database.transactions`, written by the
 * COENA Wine List app. Each document is one stock movement for one wine:
 * `currentStock` is the stock before, `newStock` the stock after.
 *
 * Int64 fields (Long) arrive as plain numbers: the driver's default
 * `promoteLongs: true` converts them when they fit in a JS number.
 */
export type CoenaWine = {
  cloudKitID?: string;
  name: string;
  /** Holds the appellation in practice (e.g. "AOC POUILLY FUISSE"). */
  cepage?: string;
  /** Numeric wine category from the wine list app — meaning not confirmed yet. */
  type?: number;
  millesime?: number;
  region?: string;
  country?: string;
};

export type CoenaTransaction = {
  id: string;
  ownerId: string;
  wine: CoenaWine;
  date: Date;
  quantity: number;
  transactionType: number;
  tableNumber?: number;
  numberofPeopleatTable?: number;
  /** "Bouteille" in the samples; glass sales presumably use another value. */
  containerType?: string;
  volume?: string;
  totalPrice?: number;
  unitPrice?: number;
  currentStock?: number;
  newStock?: number;
  /** Human-readable reason, e.g. "Vente". */
  reason?: string;
};

/** Where screen data comes from: the COENA backend, the two built-in samples, or nothing. */
export type DataSource = "api" | "demo" | "none";

/** transactionType 10 + reason "Vente" in every sample: inferred, not confirmed. */
export const TRANSACTION_TYPE_SALE = 10;

export function isSale(t: Pick<CoenaTransaction, "transactionType">) {
  return t.transactionType === TRANSACTION_TYPE_SALE;
}

export function isGlass(containerType: string | undefined) {
  return /verre|glass/i.test(containerType ?? "");
}

export function formatLabel(t: Pick<CoenaTransaction, "containerType" | "volume">) {
  return [t.containerType, t.volume].filter(Boolean).join(" ");
}

/** Signed stock change, e.g. -2 for a sale of two bottles. */
export function stockDelta(t: Pick<CoenaTransaction, "currentStock" | "newStock">) {
  if (typeof t.currentStock !== "number" || typeof t.newStock !== "number") return undefined;
  return t.newStock - t.currentStock;
}

export type SalesGroup = { containerType?: string; quantity: number; revenue: number };

export type SalesSummary = {
  revenue: number;
  bottles: number;
  glasses: number;
  /** Average price per bottle sold, undefined when no bottle was sold. */
  avgBottlePrice?: number;
};

export function summarizeSales(groups: SalesGroup[]): SalesSummary {
  let revenue = 0;
  let bottles = 0;
  let glasses = 0;
  let bottleRevenue = 0;
  for (const g of groups) {
    revenue += g.revenue;
    if (isGlass(g.containerType)) {
      glasses += g.quantity;
    } else {
      bottles += g.quantity;
      bottleRevenue += g.revenue;
    }
  }
  return { revenue, bottles, glasses, avgBottlePrice: bottles > 0 ? bottleRevenue / bottles : undefined };
}

/** Raw MongoDB document → app type. Tolerates missing optional fields. */
export function fromDocument(doc: Record<string, unknown>): CoenaTransaction {
  const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "bigint" ? Number(v) : undefined);
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const w = (doc.wine ?? {}) as Record<string, unknown>;
  return {
    id: String(doc._id),
    ownerId: String(doc.owner_id ?? ""),
    wine: {
      cloudKitID: str(w.cloudKitID),
      name: str(w.name) ?? "",
      cepage: str(w.cepage),
      type: num(w.type),
      millesime: num(w.millesime),
      region: str(w.region),
      country: str(w.country),
    },
    date: doc.date instanceof Date ? doc.date : new Date(String(doc.date)),
    quantity: num(doc.quantity) ?? 0,
    transactionType: num(doc.transactionType) ?? -1,
    tableNumber: num(doc.tableNumber),
    numberofPeopleatTable: num(doc.numberofPeopleatTable),
    containerType: str(doc.containerType),
    volume: str(doc.volume),
    totalPrice: num(doc.totalPrice),
    unitPrice: num(doc.unitPrice),
    currentStock: num(doc.currentStock),
    newStock: num(doc.newStock),
    reason: str(doc.reason),
  };
}
