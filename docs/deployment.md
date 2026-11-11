# Deploying on Vercel (Frankfurt)

The app runs on Vercel in the Frankfurt region (`fra1`, set in `vercel.json`),
next to the MongoDB Atlas cluster, which is also in Frankfurt.
The COENA domain stays at IONOS; only a DNS record points to Vercel.

## 1. Create the project
1. Create a Vercel account and a team on the **Pro** plan (the free Hobby plan is for non-commercial use only).
2. **Add New → Project**, import `guillaume654/COENA-admin` from GitHub.
3. Framework preset: Next.js (detected). Leave the build settings as they are.
4. **Settings → Git → Production Branch**: set the branch to deploy (today `claude/upbeat-clarke-jsphvj`; `main` once merged).

Every push then deploys automatically; other branches get their own preview link.

## 2. Environment variables
In **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `COENA_API_URL` | The COENA backend: `https://q1a21h275f.execute-api.eu-west-1.amazonaws.com/prod` (live) |
| `SESSION_SECRET` | 64 random characters (`openssl rand -hex 32`). Changing it signs everyone out. |
| `COENA_TIMEZONE` | `Europe/Paris` |

Leave `COENA_DEMO_DATA` unset in production. Redeploy after changing variables.

## 3. How sign-in works
- Users sign in with their **COENA account** (same login and password as on the iPad).
- The app's server hashes the password (SHA-256, like the iPad app) and calls the backend's `POST /auth`.
  The password is never stored.
- The backend's tokens are kept in an **encrypted, httpOnly cookie** (AES-256-GCM); the browser cannot read them.
  The access token (10 min) is renewed automatically by the middleware; a refused renewal signs the user out.
- Data is read through the backend, always filtered on the active venue taken from the session.
  Rows that belong to another venue are dropped even if the backend returns them.
- Venue switcher: own account and its `linkedAccounts`; `ADMIN` accounts can open any venue from **/venues**.
- The app no longer connects to MongoDB directly, so no Atlas access list change is needed for Vercel.

## 4. Domain (at IONOS)
1. In Vercel: **Settings → Domains → Add** `cave.coena.fr` (or another subdomain).
2. In IONOS DNS for `coena.fr`, add the record Vercel shows (a `CNAME` for `cave` pointing to Vercel).
3. Vercel issues the HTTPS certificate automatically.

The existing website and email at IONOS are not affected.
