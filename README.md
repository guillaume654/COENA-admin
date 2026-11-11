# COENA Cave — stock & cellar management

Web app for sommeliers, F&B managers and cellar managers, companion to the COENA digital wine list.
Single venue, French/English.

**Status:** every screen is laid out. Sales, Movements and the dashboard read COENA wine list
transactions from MongoDB Atlas when configured; other screens are empty until their data exists.

- [`docs/market-research.md`](docs/market-research.md): market scan and feature priorities.
- [`docs/data-model.md`](docs/data-model.md): how wine list transactions map to the app, and open questions.
- [`docs/deployment.md`](docs/deployment.md): hosting on Vercel (Frankfurt), Atlas access and the IONOS domain.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To read real data, copy `.env.example` to `.env.local` and set `MONGODB_URI` and `COENA_OWNER_ID`.
To preview with the two sample transactions instead, set `COENA_DEMO_DATA=1`.

## Structure

| Path | What |
|---|---|
| `src/app/globals.css` | COENA brand colors (Garnet, black, grays) as tokens. |
| `src/app/layout.tsx` | Brand fonts: Cormorant Garamond (headlines), Inter (body). |
| `public/brand/` | COENA logos (garnet and white). `src/app/icon.png` is the plate mark. |
| `src/lib/data/` | MongoDB transaction types, mapping and read-only queries. |
| `src/lib/i18n/fr.ts`, `en.ts` | All UI text. French is default; locale stored in a `coena-locale` cookie. |
| `src/lib/nav.ts` | Sidebar navigation (routes, icons, groups). |
| `src/components/ModulePage.tsx` | Generic module screen built from the dictionary. |
| `src/app/(app)/*` | One route per module. |

## Next steps
- Answer the open questions in `docs/data-model.md`, then wire Stock and Wine list to the wine catalogue.
- Authentication and roles (and per-user venue instead of `COENA_OWNER_ID`).
