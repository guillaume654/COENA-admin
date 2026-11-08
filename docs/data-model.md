# COENA wine list data → stock app

Source: MongoDB Atlas, `COENA Production` → `DigitalMenu-Database` → `transactions` (~202K documents).
Code: `src/lib/data/coena.ts` (types and mapping), `src/lib/data/transactions.ts` (read-only queries).

## What a transaction is

Each document is **one stock movement for one wine**, written by the wine list app.
The app already keeps a stock per wine: `currentStock` is the stock before, `newStock` the stock after.

| Field | Example | Used for |
|---|---|---|
| `owner_id` | `5d88c9e7…` | Venue. Every query is scoped to `COENA_OWNER_ID`. |
| `iCloudAccountName` | `lecantou` | Not read (excluded from queries). |
| `wine.name` | `Marie Antoinette. Vincent` | Wine label |
| `wine.cepage` | `AOC POUILLY FUISSE` | Shown as **appellation** (despite the field name) |
| `wine.type` | `1`, `2` | Wine category — **meaning not confirmed** |
| `wine.millesime`, `region`, `country` | `2017`, `Bourgogne`, `France` | Vintage, region, country |
| `wine.cloudKitID` | `8010D8FC-…` / `64623836…` | Stable wine identifier (two formats seen) |
| `date` | `2019-09-26T21:26:51Z` | Movement date (UTC, shown in Europe/Paris) |
| `quantity` | `2` | Units moved |
| `transactionType` | `10` | `10` = sale (inferred from `reason: "Vente"`) |
| `tableNumber`, `numberofPeopleatTable` | `0` | Table and covers; `0` treated as "not recorded" |
| `containerType`, `volume` | `Bouteille`, `75cl` | Format; glass vs bottle split |
| `unitPrice`, `totalPrice` | `42`, `84` | Selling price (no purchase cost in this collection) |
| `currentStock` → `newStock` | `3 → 1` | Stock before / after |
| `reason` | `Vente` | Movement reason shown in Movements |

## Wired screens

- **Sales**: sales (`transactionType: 10`), latest 100, plus 7-day revenue, bottles, glasses, average bottle price.
- **Movements**: all transaction types, latest 100, with signed quantity and stock before/after.
- **Dashboard**: "Sales (7 days)" KPI and the five latest sales.

## Open questions

1. Other `transactionType` / `reason` values (restock, loss, adjustment…)?
2. What does `wine.type` mean (1 = red, 2 = white…)?
3. Value of `containerType` for wines by the glass?
4. Is there a wines/catalogue collection holding current stock, list price and purchase cost?
5. Which fields do the 3 existing indexes cover? Queries filter on `owner_id` and sort by `date`.
