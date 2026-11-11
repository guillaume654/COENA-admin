# Deploying on AWS Amplify Hosting

The app runs on **AWS Amplify Hosting** in COENA's existing AWS account, region **Ireland (eu-west-1)**,
next to the COENA backend it calls. The COENA domain stays at IONOS; only DNS records point to Amplify.

Build settings are in [`amplify.yml`](../amplify.yml) (Node.js 22, Next.js server-side rendering).
Nothing here touches the backend's CDK stacks.

## 1. Create the app (AWS console, ~10 minutes)

1. Sign in to the AWS console, switch the region (top right) to **Europe (Ireland) eu-west-1**.
2. Open **AWS Amplify** → **Create new app** (or **Deploy an app**).
3. Source: **GitHub** → **Next**. A GitHub window asks to install/authorise the **AWS Amplify** GitHub App:
   give it access to **`guillaume654/COENA-admin` only** (not all repositories).
4. Repository `COENA-admin`, branch **`claude/upbeat-clarke-jsphvj`** (switch to `main` once it's merged) → **Next**.
5. App settings:
   - App name: `coena-cave`.
   - Build settings: Amplify detects **`amplify.yml`** from the repository and the framework **Next.js - SSR**. Keep them.
   - Service role: **Create and use a new service role** (lets Amplify write the app's logs to CloudWatch).
6. **Advanced settings → Environment variables**: add the three below (see section 2).
7. **Next** → **Save and deploy**. The first build takes 3–5 minutes.
8. Open the `https://<branch>.<app-id>.amplifyapp.com` link Amplify shows. You should land on the **Connexion** page.

## 2. Environment variables

In the app: **Hosting → Environment variables** (or step 6 above).

| Name | Value |
|---|---|
| `COENA_API_URL` | `https://q1a21h275f.execute-api.eu-west-1.amazonaws.com/prod` (live backend) |
| `SESSION_SECRET` | 64 random characters, e.g. from `openssl rand -hex 32`. Changing it signs everyone out. |
| `COENA_TIMEZONE` | `Europe/Paris` |

Leave `COENA_DEMO_DATA` unset.

**After changing a variable, redeploy** (Hosting → the branch → **Redeploy this version**): Amplify only passes
variables to the build, and `amplify.yml` writes these to `.env.production` so the running app can read them.
They are not exposed to the browser.

## 3. Restrict access until launch (recommended)

**Hosting → Access control → Manage access**: set the branch to **Restricted - password required**,
with a username and password you share with the team. Visitors then need that password before even seeing the
COENA login page. Remove it when the app opens to venues.

## 4. Custom domain `cave.coena.fr` (DNS at IONOS)

1. Amplify: **Hosting → Custom domains → Add domain** → enter `coena.fr` → **Configure domain**.
2. Keep only the subdomain **`cave`** pointing to the branch; **untick the root domain and `www`**
   (the website stays at IONOS).
3. Amplify shows **two DNS records** (because DNS is not managed by AWS Route 53):
   - a **CNAME for certificate validation** (name like `_abc123.coena.fr`, value ending in `acm-validations.aws`)
   - a **CNAME for `cave`** (value ending in `cloudfront.net`)
4. IONOS: **Domains & SSL → coena.fr → DNS → Add record → CNAME**, once for each record, copying name and value exactly.
5. Back in Amplify the status goes from *Pending verification* to *Available* (from a few minutes up to a few hours).
   The HTTPS certificate is issued and renewed automatically.

The existing website and email at IONOS are not affected.

## 5. How sign-in works
- Users sign in with their **COENA account** (same login and password as on the iPad).
- The app's server hashes the password (SHA-256, like the iPad app) and calls the backend's `POST /auth`.
  The password is never stored.
- The backend's tokens are kept in an **encrypted, httpOnly cookie** (AES-256-GCM); the browser cannot read them.
  The access token (10 min) is renewed automatically by the middleware; a refused renewal signs the user out.
- Data is read through the backend, always filtered on the active venue taken from the session.
  Rows that belong to another venue are dropped even if the backend returns them.
- Venue switcher: own account and its `linkedAccounts`; `ADMIN` accounts can open any venue from **/venues**.
- The app does not connect to MongoDB, so no Atlas access-list change is needed.

## 6. After the first deploy, check
1. Opening any page while signed out redirects to **/login** (if not, the variables didn't reach the server:
   check section 2 and redeploy).
2. Sign in with a real COENA account. If a correct password is refused, the password format assumption
   (lowercase SHA-256) needs adjusting.
3. Sales and Movements show the venue's sales. The first load can be slow for venues with a long history
   (the backend's `GET /transaction` has no paging yet).
4. An `ADMIN` account sees **Tous les établissements…** in the venue menu.

Logs: **Hosting → Monitoring** (requests, errors) and **Hosting → Logs** (build logs). Server logs are in
CloudWatch, under the service role created in step 1.

## 7. Cost
Amplify Hosting charges for build minutes, data served and server-side requests. At the expected volume
(a handful of venues and staff) this should stay at a few dollars a month. Check **Billing → Bills** after the
first month.

## 8. Every update
Each push to the connected branch builds and deploys automatically. To preview another branch, connect it in
**Hosting → Branches** (it gets its own URL; apply the same access control).
