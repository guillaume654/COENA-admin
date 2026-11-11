/**
 * Auth configuration, read from environment variables.
 * Edge-safe: imported by middleware as well as server code.
 *
 * - "backend": COENA_API_URL is set; users log in with their COENA account.
 * - "demo":    no backend, COENA_DEMO_DATA=1; no login, sample data only.
 * - "unconfigured": neither; the login page explains what is missing.
 */
export type AuthMode = "backend" | "demo" | "unconfigured";

export function apiBaseUrl(): string | undefined {
  const url = process.env.COENA_API_URL?.trim();
  return url ? url.replace(/\/+$/, "") : undefined;
}

export function authMode(): AuthMode {
  if (apiBaseUrl()) return "backend";
  if (process.env.COENA_DEMO_DATA === "1") return "demo";
  return "unconfigured";
}

export const SESSION_COOKIE = "coena-session";
/** How long a browser stays signed in without activity (the backend refresh token lasts longer). */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
/** Refresh the backend access token when it has less than this left. */
export const REFRESH_MARGIN_SECONDS = 60;
