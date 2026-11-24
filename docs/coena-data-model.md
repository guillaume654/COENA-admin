# COENA data model (reference)

Condensed from the Notion page **COENA Data model** (COENA Technical Docs, status Approved, last edited 2026-08-26):
https://app.notion.com/p/COENA-Data-model-98f42673fee040ba9b1540fc4033b62a

The Notion page is the source of truth; this file keeps what COENA Reserve relies on, so it is available in the code.
Backend behaviour (routes, access levels) is in the API reference shared by the backend team (`docs/API.md`, not in this repo).

## Architecture
- Originally iCloud/CloudKit (public container, one account per customer, data filtered by account).
- Today: MongoDB Atlas behind the COENA backend (AWS API Gateway + Lambda). Records are tied to an account by its
  **`login`**: `ownedByAccount` on wines, cocktails, dishes, dish categories, food menus, orders;
  **`iCloudAccountName`** on transactions.
- Record types: Account, Wine, Cocktail, Dish, DishCategory, FoodMenu, Transaction (MongoDB only in production),
  Device, InfoChange (iPad sync), AI prompts.

## Wine
| Field | Meaning |
|---|---|
| `name` | **appellation** of the wine (in practice often the full wine name) |
| `cepage` | **domaine** (estate) |
| `type` | **category: 0 = apéritif wines / Champagnes, 1 = red, 2 = white, 3 = rosé, 4 = dessert wines** |
| `millesime` | vintage year |
| `region`, `pays` | region, country |
| `cellarName` | cellar the wine is in (see Account `cellarsList`) |
| `bin` | bin number |
| `localisationCaveZone`, `localisationCaveXString`, `localisationCaveYString` | position in the cellar: zone, row, column |
| `stock50cl`, `stock75cl`, `stock150cl`, `stock300cl`, `stock375cl` | stock per bottle size (`375cl` = half bottle 37.5 cl) |
| `stockverre` | stock in glasses (open bottles) |
| `prixbouteille75cl`, `…150cl`, `…300cl`, `prixdemibouteille375cl`, `prixdemibouteille50cl` | selling price per size |
| `prixachatbouteille75cl`, `…150cl`, `…300cl`, `prixachatdemibouteille375cl`, `prixachatdemibouteille50cl` | purchase price per size |
| `prixverre`, `prixpichet25`, `prixpichet50` | selling price by the glass / carafe |
| `monthinventory…` / `datemonthinventory…` | monthly inventory value and date, per size (`-1` = no count) |
| `enstock` | in stock or not (int, should be boolean) |
| `selection`, `midi`, `soir` | "selection" badge; shown at lunch / dinner |
| `bio`, `biodyn`, `bionaturel`, `alcohol`, `medailleor`, `oenorium` | flags and codes |
| `robertParkerNote`, `wineSpectatorNote` | critic scores |
| `accordsL1-3`, `degustationL1-3`, `domaineL1-3`, `viticulteurL1-3` | food pairing, tasting, estate, winemaking texts (3 languages) |
| `photo`, `domaineImage`, `viticulteurImage` | images |

## Account (fields used or likely to be used by COENA Reserve)
| Field | Meaning |
|---|---|
| `login` | login; value used in `ownedByAccount` / `iCloudAccountName` |
| `name` | venue name |
| `roles` | `["ADMIN"]` = access to the COENA admin interface (every owner has it today) |
| `linkedAccounts` | accounts a group can switch to (Notion: values are `recordName`; the backend matches `login`) |
| `stockMgt` | stock management module enabled (0/1) |
| `cellarsList` | cellar names (e.g. "Service", "Aging"); empty = feature off |
| `selectedCellarName` | cellar shown to guests |
| `wineGlassesPerBottle` | glasses per 75 cl bottle, used to destock glass sales |
| `glassVolumes` | glass volume in cl per category (index = wine `type`) |
| `labelAperitifWines` | label of category 0: 0 = Aperitif wines, 1 = Champagnes, 2 = Sparkling wines |
| `labelDessertWines` | label of category 4: 0 = Dessert wines, 1 = Desserts, 2 = Sweet wines, 3 = Sakes |
| `groupDiscountRatioNEW` | discount for group sales (stock module) |
| `vatValue` | VAT used for brutto/netto margins in transactions |
| `currency`, `currencyPosition`, `currencySeparator` | price display |
| `standardLanguage` | 0 = English, 1 = French |
| `languagesCustomerInterface` | language order: 1 FR, 2 EN, 3 DE, 4 IT, 5 ES, 6 NL |
| `accountStatus` | 0 = available, 1 = on hold (unpaid) |
| `accountDemoRestricted` | 0 = none, 1 = partial, 2 = full lock (demo) |
| `orderModule`, `iKentooIntegration` | ordering and POS (Lightspeed via HubRise) integration settings |
| `mondoDBGraphsURLs` | URLs of the MongoDB Charts graphs shown in the iPad analytics |

## Transaction (stock module, MongoDB)
See [`data-model.md`](data-model.md) for how COENA Reserve reads them. `transactionType` 10 = sale ("Vente").
Other values not documented yet.
