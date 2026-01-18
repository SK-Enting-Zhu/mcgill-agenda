import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

function isPublic(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

function isProtected(pathname: string) {
  return (
    pathname === "/main" ||
    pathname === "/calendar" ||
    pathname === "/todo" ||
    pathname === "/notifications" ||
    pathname === "/settings" ||
    pathname.startsWith("/main/") ||
    pathname.startsWith("/calendar/") ||
    pathname.startsWith("/todo/") ||
    pathname.startsWith("/notifications/") ||
    pathname.startsWith("/settings/") ||
    pathname.startsWith("/api/events") ||
    pathname.startsWith("/api/import-syllabi")
  );
}

/**
 * Turbopack can use proxy.ts as the request hook.
 * This runs for requests that match config.matcher.
 */
export default async function proxy(req: NextRequest) {
  const res = await auth0.middleware(req);
  const pathname = req.nextUrl.pathname;

  if (isPublic(pathname)) return res;
  if (!isProtected(pathname)) return res;

  const session = await auth0.getSession(req);
  if (session?.user) return res;

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("returnTo", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};