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
| `MONGODB_URI` | Atlas connection string of a **read-only** database user |
| `MONGODB_DB` | `DigitalMenu-Database` |
| `COENA_OWNER_ID` | the venue's `owner_id` |
| `COENA_TIMEZONE` | `Europe/Paris` |

Leave `COENA_DEMO_DATA` unset in production. Redeploy after changing variables.

> Do not add the real `MONGODB_URI` until the app has a login: without one, anyone with the address can see the venue's sales.

## 3. MongoDB Atlas network access
Vercel's outgoing IP addresses change, so Atlas cannot be limited to a fixed address by default.

- **Default:** in Atlas **Security → Network Access**, allow `0.0.0.0/0`, and rely on a dedicated read-only user
  with a long random password (connections are encrypted with TLS).
- **Stricter, paid:** Vercel **Static IPs** (Pro, about $100/month per project) give a fixed IP pair to allow in Atlas instead.

## 4. Domain (at IONOS)
1. In Vercel: **Settings → Domains → Add** `cave.coena.fr` (or another subdomain).
2. In IONOS DNS for `coena.fr`, add the record Vercel shows (a `CNAME` for `cave` pointing to Vercel).
3. Vercel issues the HTTPS certificate automatically.

The existing website and email at IONOS are not affected.
