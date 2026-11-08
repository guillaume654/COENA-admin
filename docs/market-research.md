# Wine & beverage inventory software — market scan (Nov 2026)

> How solid this is: built from vendor marketing, review directories and press. Some vendor sites
> (binwise.com, vinify.app, douane.gouv.fr) could not be opened directly. Feature claims are mostly
> the vendors' own; prices are only as reliable as the cited source.

## 1. Main players

| Player | Market | Positioning | Notable features | Digital wine list? |
|---|---|---|---|---|
| **BinWise** | US (+ some Europe, e.g. Geranium) | Wine-first inventory for fine dining (The French Laundry, Daniel, Atomix, NoMad). Claims 80% of US 3★ restaurants (unverified). | Barcode scan auto-fills producer/vintage, bin locations, movement history, by-the-glass pour cost, 30+ POS/accounting integrations, purchasing via BlueCart | **Yes** — closest direct competitor to COENA |
| **Uncorkd** | US | iPad drinks menus + inventory, purchasing, analytics | Real-time sales data | Yes |
| **Craftable** (ex-Bevager) | US | F&B back office for multi-unit groups and hotels | Inventory, invoices, POS, e-procurement | No |
| **WISK.ai** | North America (FR site) | Bar & restaurant inventory | Bluetooth scales, 200k-bottle barcode DB, 60+ POS integrations; ~$165–189/month | No |
| **Partender** | US | Fast bar counting | Slider estimates for partial bottles | No |
| **Backbar / Provi / SevenFifty** | US | Free inventory + distributor ordering marketplace | Counting, ordering | No |
| **Sculpture Hospitality** | NA + franchises | Consultant-led weigh-and-count audits | Variance reports | No |
| **Vinify** | Norway / Europe | Cellar manager for restaurants & wine bars; Star Wine List partner | Live list synced to stock, sales imports, Liv-ex market values; free tier, ~€39/month | **Yes** |
| **Somm'it** | Bordeaux, France | From bistros to Michelin-starred tables (launched with Gérard Basset) | Tablet/print list, stock, suppliers, alerts, till sync | **Yes** — direct French competitor |
| **GoStan** | Bordeaux, France | Beverage stock + analytics for sommeliers (raised €350k, 2024) | Not verified | Not verified |
| **Apicbase** | Belgium | F&B platform for multi-site groups and hotels | Procurement, recipes, inventory (food-centric) | No |
| **Koust / Melba / Inpulse** | France | General restaurant back office | No wine-specific depth | No |

**Who leads where**
- **US:** BinWise for wine-centric fine dining; WISK, Partender, Backbar, Craftable for bars and multi-unit groups.
- **Europe / France:** fragmented. Apicbase/Koust for general F&B; Vinify, Somm'it, GoStan for wine. No dominant French cellar tool.
- **Luxury / fine dining:** BinWise is the only player with a visible Michelin base. In France only Somm'it targets starred tables with list + stock.
- **Opening for COENA:** a French-native, palace-grade tool combining wine list and stock.

## 2. Feature priorities

### Must-have (MVP)
1. Catalogue tied to the COENA list: producer, cuvée, vintage, format (37.5 cl → 300 cl+), colour, region.
2. Storage zones per venue (cellar, day cellar, bar, service fridge) with **bin locations** and movement history.
3. Stock counts on iPad/phone: barcode/label scan, manual entry, offline, count sheets ordered by cellar route.
4. Receiving deliveries, linked to a purchase order or direct, with cost and supplier.
5. **Automatic depletion from sales** (bottle and glass) from COENA transactions, later POS.
6. Variance reports (theoretical vs counted) and losses (breakage, corked, tastings, comps).
7. Valuation (weighted average cost first), COGS, **pour cost / margin per wine**.
8. Low-stock alerts and **auto-hide of sold-out wines on the list** (table stakes: BinWise, Somm'it, Vinify).
9. Roles (head sommelier, sommelier, F&B, finance, read-only) and audit log.
10. Excel/CSV import & export.

### Should-have
- Suppliers & purchase orders (email/PDF), par levels, reorder suggestions.
- Open-bottle tracking for wines by the glass (Coravin fits the existing Coravin × COENA partnership); optional Bluetooth scales.
- Drinking windows ("hold vs pour"), allocations and en-primeur with expected arrival.
- FIFO valuation option, accounting export, multi-currency.
- POS integrations — France: Lightspeed, Zelty, L'Addition, Tiller; hotels: Oracle Simphony / Opera.
- Multi-site / transfers (out of scope for now: single venue).

### Differentiators
- Live market value of the cellar (Liv-ex / Wine-Searcher) for insurance and repricing.
- Pricing assistant: markup rules, list-price simulation.
- AI consumption forecasting, reorder points, dead-stock detection.
- Private client cellars (wine stored for VIP guests).
- French excise (DRM): a restaurant buying duty-paid wine is normally **not** a bonded warehousekeeper, so no DRM is needed. Only bonded operators would. **To be validated with a customs adviser**; low priority.

## 3. Features unlocked by COENA wine-list data (already in MongoDB)
1. Real-time depletion from list sales, matched to vintage and format.
2. Auto-86 / restock on the list, optional "last bottles" badge.
3. Theoretical vs actual stock → shrinkage detection without POS.
4. **Engagement analytics no inventory-only competitor has:** wines viewed vs ordered, search/filter usage.
5. Sales-velocity alerts and reorder suggestions from list history.
6. Pour cost per transaction; margin by server/service if captured.
7. Listed stock value vs dormant cellar stock; publish list from the cellar.

## Mapping to the UI

| Screen | Covers |
|---|---|
| Dashboard | KPIs, latest COENA sales, movements, alerts, top sellers, drinking windows |
| Alerts | Low stock, stock-outs, variances, drink-now |
| Stock | Catalogue, stock levels, par, cost, list price |
| Cellar map | Zones and bins |
| Stock counts | Physical counts and variances |
| Movements | Receipts, depletions, transfers, losses |
| By the glass | Open bottles, Coravin, cost per glass |
| Purchase orders | POs, reorder suggestions, allocations |
| Receiving | Delivery checks, PO matching |
| Suppliers | Estates, négociants, distributors |
| Sales | COENA transactions, by wine / by service |
| Wine list | Availability on the COENA list, auto-hide, pricing rules |
| Reports | Valuation, cost & margins, variances, turnover, list analysis |
| Settings | Venue, users & roles, integrations, audit log |

## Sources
- BinWise: https://www.capterra.com/p/131378/BinWise/ · https://home.binwise.com/digital-wine-list · https://home.binwise.com/wine-inventory-software · https://www.casestudies.com/company/binwise/case-study/geranium-cuts-wine-cellar-inventory-time-by-85-with-binwise
- Uncorkd: https://builtin.com/company/uncorkd
- Craftable: https://craftable.com/blog/announcement-bevager-foodager-to-rebrand-as-craftable
- WISK / Partender: https://www.wisk.ai/price · https://wisk.ai/vs/wisk-vs-partender
- Backbar / Provi: https://www.getbackbar.com/backbar-vs-provi · https://landing.provi.com/inventory
- Sculpture Hospitality: https://www.sculpturehospitality.com/about-us
- Vinify: https://starwinelist.com/wine-story/introducing-vinify-transforming-cellar-management-for-sommeliers-and-collectors-alike · https://home.vinify.app/
- Somm'it / GoStan: https://www.journaldespalaces.com/communique-51669-le-meilleur-sommelier-du-monde-lance-une-application-pour-la-restauration.html · https://finder.techleap.nl/news/feed/gostan-raises-350k-for-stock-management
- Apicbase / Koust: https://www.capterra.com/p/171584/Apicbase-Restaurant-Management/pricing/ · https://www.lafabriquedunet.fr/logiciel/koust
- Coravin × COENA: https://coravin.com/blogs/press/a-new-era-in-wine-service-coravin-x-coena-collaboration
- DRM: https://syndicat-cotesdurhone.com/article/lessentiel-sur-les-registres-de-cave
