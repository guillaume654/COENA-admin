# COENA Cave — stock & cellar management

Web app for sommeliers, F&B managers and cellar managers, companion to the COENA digital wine list.
Single venue, French/English.

**Status:** every screen is laid out. Users sign in with their COENA account through the COENA backend
(AWS). Sales, Movements and the dashboard show the venue's wine list transactions; other screens are empty
until their data exists.

- [`docs/market-research.md`](docs/market-research.md): market scan and feature priorities.
- [`docs/data-model.md`](docs/data-model.md): how wine list transactions map to the app, and open questions.
- [`docs/deployment.md`](docs/deployment.md): hosting on AWS Amplify (Ireland), environment variables and the IONOS domain.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To sign in with real COENA accounts, copy `.env.example` to `.env.local` and set `COENA_API_URL` and
`SESSION_SECRET`. To preview without a backend, leave `COENA_API_URL` empty and set `COENA_DEMO_DATA=1`.

## Structure

| Path | What |
|---|---|
| `amplify.yml` | AWS Amplify build settings. |
| `src/app/globals.css` | COENA brand colors (Garnet, black, grays) as tokens. |
| `src/app/layout.tsx` | Brand fonts: Cormorant Garamond (headlines), Inter (body). |
| `public/brand/` | COENA logos (garnet and white). `src/app/icon.png` is the plate mark. |
| `src/middleware.ts` | Sign-in guard and automatic token renewal. |
| `src/lib/auth/` | Backend client, encrypted session, access rules. |
| `src/app/actions/auth.ts` | Sign in, sign out, switch venue. |
| `src/lib/data/` | Transaction types and reads through the backend (always venue-scoped). |
| `src/lib/i18n/fr.ts`, `en.ts` | All UI text. French is default; locale stored in a `coena-locale` cookie. |
| `src/lib/nav.ts` | Sidebar navigation (routes, icons, groups). |
| `src/components/ModulePage.tsx` | Generic module screen built from the dictionary. |
| `src/app/(app)/*` | One route per module. |

## Next steps
- Wire Stock and Wine list to `GET /wine` (paged, venue-scoped).
- Backend: date range and paging on `GET /transaction`, and the fixes in the backend review.
