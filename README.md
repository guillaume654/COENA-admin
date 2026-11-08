# COENA Cave — stock & cellar management

Web app for sommeliers, F&B managers and cellar managers, companion to the COENA digital wine list.
Single venue, French/English.

**Status:** empty UI — every screen is laid out with headers, KPI tiles, tabs and tables, but no data yet.
Data will come from MongoDB Atlas (COENA wine list transactions).

See [`docs/market-research.md`](docs/market-research.md) for the market scan and feature priorities.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

| Path | What |
|---|---|
| `src/app/globals.css` | Brand tokens (colors). Replace with COENA brand assets here only. |
| `src/app/layout.tsx` | Fonts (placeholders: Inter + Playfair Display). |
| `src/lib/i18n/fr.ts`, `en.ts` | All UI text. French is default; locale stored in a `coena-locale` cookie. |
| `src/lib/nav.ts` | Sidebar navigation (routes, icons, groups). |
| `src/components/ModulePage.tsx` | Generic module screen built from the dictionary. |
| `src/app/(app)/*` | One route per module. |

## Next steps
- Drop in COENA logo, colors and fonts.
- Connect MongoDB Atlas (`MONGODB_URI` in `.env.local`, see `.env.example`) and map wine-list transactions to sales/depletions.
- Authentication and roles.
