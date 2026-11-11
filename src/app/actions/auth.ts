"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authMode, SESSION_COOKIE } from "@/lib/auth/config";
import { backendGet, backendLogin, BackendError, pickAccount, tokenExpiry } from "@/lib/auth/backend";
import { canAccess, sealSession, sessionCookieOptions, type Session } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/server";

export type LoginState = {
  error?: "invalid" | "unavailable" | "unconfigured" | "missing";
  /** Typed login, kept so the field isn't cleared after an error. Never the password. */
  login?: string;
};

/** Only same-site relative paths, to avoid open redirects. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
}

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (authMode() !== "backend") return { error: "unconfigured" };

  const login = String(form.get("login") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!login || !password || login.length > 200 || password.length > 500) return { error: "missing", login };

  let session: Session;
  try {
    const tokens = await backendLogin(login, password);
    const account = pickAccount(await backendGet<Record<string, unknown>>("/account/me", tokens.token));
    if (!account.login) return { error: "unavailable", login };
    session = {
      accessToken: tokens.token,
      refreshToken: tokens.refreshToken,
      accessExp: tokenExpiry(tokens.token),
      login: account.login,
      name: account.name,
      roles: account.roles,
      linkedAccounts: account.linkedAccounts,
      activeLogin: account.login,
      activeName: account.name,
    };
  } catch (e) {
    if (e instanceof BackendError && e.status === 401) {
      // Slow down password guessing a little; the backend has no lockout.
      await new Promise((r) => setTimeout(r, 800));
      return { error: "invalid", login };
    }
    console.error("Login failed:", e instanceof Error ? e.message : e);
    return { error: "unavailable", login };
  }

  (await cookies()).set(SESSION_COOKIE, await sealSession(session), sessionCookieOptions);
  redirect(safeNext(form.get("next")));
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

/** Switch the venue whose data is shown. Allowed: own account, linked accounts, any account for ADMIN. */
export async function switchVenueAction(form: FormData) {
  if (authMode() !== "backend") return;
  const session = await getSession();
  if (!session) redirect("/login");

  const target = String(form.get("login") ?? "").trim();
  if (!target || !canAccess(session, target)) return;

  const name = String(form.get("name") ?? "").trim() || undefined;
  const next: Session = {
    ...session,
    activeLogin: target,
    activeName: target === session.login ? session.name : name,
  };
  (await cookies()).set(SESSION_COOKIE, await sealSession(next), sessionCookieOptions);
  revalidatePath("/", "layout");
  if (form.get("redirect") === "home") redirect("/");
}
