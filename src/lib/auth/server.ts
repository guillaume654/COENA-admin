import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authMode, SESSION_COOKIE } from "./config";
import { openSession, type Session } from "./session";

const DEMO_SESSION: Session = {
  accessToken: "",
  refreshToken: "",
  accessExp: 0,
  login: "demo",
  name: "Démo",
  roles: [],
  linkedAccounts: [],
  activeLogin: "demo",
  activeName: "Démo",
};

/** The signed-in user for this request, or null. Cached per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const mode = authMode();
  if (mode === "demo") return DEMO_SESSION;
  if (mode === "unconfigured") return null;
  return openSession((await cookies()).get(SESSION_COOKIE)?.value);
});

/** Like getSession, but sends signed-out visitors to the login page. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
