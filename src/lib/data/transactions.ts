import "server-only";
import { MongoClient, type Document } from "mongodb";
import {
  fromDocument,
  isSale,
  summarizeSales,
  TRANSACTION_TYPE_SALE,
  type CoenaTransaction,
  type DataSource,
  type SalesGroup,
  type SalesSummary,
} from "./coena";
import { demoTransactions } from "./fixtures";

/**
 * Read-only access to COENA wine list transactions in MongoDB Atlas.
 * Single venue: every query is scoped to COENA_OWNER_ID (the `owner_id` field).
 * Without configuration every function returns empty results, so the UI stays empty.
 */
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "DigitalMenu-Database";
const ownerId = process.env.COENA_OWNER_ID;
const demo = process.env.COENA_DEMO_DATA === "1";

export function dataSource(): DataSource {
  if (uri && ownerId) return "mongodb";
  if (demo) return "demo";
  return "none";
}

// Reuse one client across hot reloads in dev and across requests in prod.
const globalForMongo = globalThis as unknown as { coenaMongo?: Promise<MongoClient> };

function collection() {
  globalForMongo.coenaMongo ??= new MongoClient(uri!, { appName: "coena-cellar" }).connect();
  return globalForMongo.coenaMongo.then((c) => c.db(dbName).collection("transactions"));
}

export async function getTransactions({
  limit = 50,
  salesOnly = false,
}: { limit?: number; salesOnly?: boolean } = {}): Promise<CoenaTransaction[]> {
  const source = dataSource();
  if (source === "demo") return demoTransactions.filter((t) => !salesOnly || isSale(t)).slice(0, limit);
  if (source === "none") return [];

  const filter: Document = { owner_id: ownerId };
  if (salesOnly) filter.transactionType = TRANSACTION_TYPE_SALE;
  const docs = await (await collection())
    .find(filter, { projection: { iCloudAccountName: 0 } })
    .sort({ date: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => fromDocument(d));
}

/** Sales over the last `days` days, grouped by container (bottle / glass). */
export async function getSalesSummary(days = 7): Promise<SalesSummary | undefined> {
  const source = dataSource();
  if (source === "none") return undefined;

  let groups: SalesGroup[];
  if (source === "demo") {
    // Demo data dates from 2019, so the time window is ignored.
    groups = demoTransactions.filter(isSale).map((t) => ({
      containerType: t.containerType,
      quantity: t.quantity,
      revenue: t.totalPrice ?? 0,
    }));
  } else {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    groups = await (await collection())
      .aggregate<SalesGroup>([
        { $match: { owner_id: ownerId, transactionType: TRANSACTION_TYPE_SALE, date: { $gte: since } } },
        { $group: { _id: "$containerType", quantity: { $sum: "$quantity" }, revenue: { $sum: "$totalPrice" } } },
        { $project: { _id: 0, containerType: "$_id", quantity: 1, revenue: 1 } },
      ])
      .toArray();
  }
  return summarizeSales(groups);
}
