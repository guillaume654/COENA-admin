import { apiBaseUrl } from "./config";

/**
 * Calls to the COENA backend (API Gateway + Lambda, eu-west-1).
 * Edge-safe: used by middleware (token refresh) and server code.
 */

export class BackendError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type Tokens = { token: string; refreshToken: string };

/**
 * The backend compares the submitted value as-is with the stored `password`,
 * which the iPad app stores as lowercase hex SHA-256. We hash the same way.
 */
export async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Reads `exp` from a JWT without verifying it: the backend verifies, we only need the timing. */
export function tokenExpiry(jwt: string): number {
  try {
    const part = jwt.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json).exp;
    return typeof exp === "number" ? exp : 0;
  } catch {
    return 0;
  }
}

function url(path: string) {
  const base = apiBaseUrl();
  if (!base) throw new BackendError("COENA_API_URL is not set", 500);
  return `${base}${path}`;
}

async function parseTokens(res: Response): Promise<Tokens> {
  const body = (await res.json().catch(() => ({}))) as Partial<Tokens>;
  if (typeof body.token !== "string" || typeof body.refreshToken !== "string") {
    throw new BackendError("Unexpected response from the backend", 502);
  }
  return { token: body.token, refreshToken: body.refreshToken };
}

/** POST /auth. Throws BackendError(401) for wrong credentials (the backend answers 400). */
export async function backendLogin(login: string, password: string): Promise<Tokens> {
  const res = await fetch(url("/auth"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password: await hashPassword(password) }),
    cache: "no-store",
  });
  if (res.status === 400 || res.status === 401 || res.status === 404) {
    throw new BackendError("Invalid credentials", 401);
  }
  if (!res.ok) throw new BackendError(`Login failed (${res.status})`, res.status);
  return parseTokens(res);
}

/** POST /auth/refresh with the refresh token as Bearer. */
export async function backendRefresh(refreshToken: string): Promise<Tokens> {
  const res = await fetch(url("/auth/refresh"), {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new BackendError(`Refresh failed (${res.status})`, res.status === 403 ? 401 : res.status);
  return parseTokens(res);
}

/** Give up on slow backend calls before the hosting platform's own request limit (~30 s). */
function timeoutMs() {
  const v = Number(process.env.COENA_API_TIMEOUT_MS);
  return Number.isFinite(v) && v > 0 ? v : 20_000;
}

/** GET with the access token. A timeout or a gateway timeout raises BackendError(504). */
export async function backendGet<T>(path: string, accessToken: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url(path), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs()),
    });
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "TimeoutError" || name === "AbortError") throw new BackendError(`Timeout on ${path.split("?")[0]}`, 504);
    throw new BackendError(`Backend unreachable on ${path.split("?")[0]}`, 503);
  }
  if (res.status === 401 || res.status === 403) throw new BackendError("Not authorised", 401);
  if (!res.ok) throw new BackendError(`Backend error on ${path.split("?")[0]} (${res.status})`, res.status);
  return (await res.json()) as T;
}

/** The fields we use from GET /account/me. Everything else (incl. password) is dropped. */
export type BackendAccount = {
  login: string;
  name?: string;
  roles: string[];
  linkedAccounts: string[];
};

export function pickAccount(raw: Record<string, unknown>): BackendAccount {
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  return {
    login: String(raw.login ?? ""),
    name: typeof raw.name === "string" && raw.name ? raw.name : undefined,
    roles: strings(raw.roles),
    linkedAccounts: strings(raw.linkedAccounts),
  };
}
