import { NextResponse, type NextRequest } from "next/server";
import { authMode, REFRESH_MARGIN_SECONDS, SESSION_COOKIE } from "@/lib/auth/config";
import { backendRefresh, BackendError, tokenExpiry } from "@/lib/auth/backend";
import { openSession, sealSession, sessionCookieOptions } from "@/lib/auth/session";

/**
 * Guards every page:
 * - no valid session → /login
 * - access token about to expire → refreshed here, so pages always get a working token
 * - refresh refused by the backend → signed out
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const onLogin = pathname === "/login";
  const mode = authMode();

  if (mode === "demo") {
    return onLogin ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }
  if (mode === "unconfigured") {
    return onLogin ? NextResponse.next() : NextResponse.redirect(new URL("/login", req.url));
  }

  const session = await openSession(req.cookies.get(SESSION_COOKIE)?.value).catch(() => null);

  if (onLogin) {
    if (req.nextUrl.searchParams.has("expired")) {
      const res = NextResponse.next();
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
    return session ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }

  if (!session) {
    const login = new URL("/login", req.url);
    if (pathname !== "/") login.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(login);
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  const now = Math.floor(Date.now() / 1000);
  if (session.accessExp - now > REFRESH_MARGIN_SECONDS) return NextResponse.next();

  try {
    const tokens = await backendRefresh(session.refreshToken);
    const sealed = await sealSession({
      ...session,
      accessToken: tokens.token,
      refreshToken: tokens.refreshToken,
      accessExp: tokenExpiry(tokens.token),
    });
    // Make the new cookie visible to this request's server components, and save it in the browser.
    req.cookies.set(SESSION_COOKIE, sealed);
    const res = NextResponse.next({ request: { headers: req.headers } });
    res.cookies.set(SESSION_COOKIE, sealed, sessionCookieOptions);
    return res;
  } catch (e) {
    if (e instanceof BackendError && e.status === 401) {
      const res = NextResponse.redirect(new URL("/login?expired=1", req.url));
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
    // Backend unreachable: let the page render and show its own error.
    return NextResponse.next();
  }
}

export const config = {
  // Everything except Next internals and static brand files.
  matcher: ["/((?!_next/|brand/|icon\\.png|favicon\\.ico).*)"],
};
