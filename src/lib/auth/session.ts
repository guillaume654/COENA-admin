import { EncryptJWT, jwtDecrypt } from "jose";
import { SESSION_MAX_AGE_SECONDS } from "./config";

/**
 * What the app keeps about a signed-in user, stored encrypted (AES-256-GCM)
 * in an httpOnly cookie. The browser can neither read nor change it.
 * The password is never stored.
 */
export type Session = {
  /** Backend tokens (RS256 JWTs issued by POST /auth). */
  accessToken: string;
  refreshToken: string;
  /** Access token expiry, seconds since epoch. */
  accessExp: number;
  /** The signed-in COENA account. */
  login: string;
  name?: string;
  roles: string[];
  linkedAccounts: string[];
  /** Venue whose data is shown: own login, a linked account, or any account for a super-admin. */
  activeLogin: string;
  activeName?: string;
};

/**
 * Super-admins can open every venue. Granted only to the logins listed in COENA_SUPERADMINS
 * (comma-separated), never by the backend's ADMIN role, which some venue accounts carry.
 */
export function superAdminLogins(): string[] {
  return (process.env.COENA_SUPERADMINS ?? "")
    .split(",")
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdmin(s: Pick<Session, "login">) {
  return superAdminLogins().includes(s.login.toLowerCase());
}

/** Venues a user may switch to without going through the admin list. */
export function selectableLogins(s: Pick<Session, "login" | "linkedAccounts">) {
  return [s.login, ...s.linkedAccounts.filter((l) => l !== s.login)];
}

/** Whether this user may view `target`: own account, a linked account, or any account for a super-admin. */
export function canAccess(s: Pick<Session, "login" | "linkedAccounts">, target: string) {
  return target === s.login || s.linkedAccounts.includes(target) || isSuperAdmin(s);
}

async function key(): Promise<Uint8Array> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 random characters.");
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return new Uint8Array(digest);
}

export async function sealSession(session: Session): Promise<string> {
  return new EncryptJWT({ s: session })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .encrypt(await key());
}

export async function openSession(value: string | undefined): Promise<Session | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtDecrypt(value, await key());
    const s = payload.s as Session | undefined;
    return s && typeof s.accessToken === "string" && typeof s.login === "string" ? s : null;
  } catch {
    return null; // tampered, expired, or encrypted with another secret
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
