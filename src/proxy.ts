import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

// Note: Next.js 16 renamed `middleware.ts` to `proxy.ts` (same mechanism, new name/export -
// see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password"];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/reset-password/")) return true;
  return PUBLIC_ROUTES.includes(pathname);
}

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/learn",
  "/progress",
  "/journal",
  "/business-model-canvas",
  "/final-project",
  "/achievements",
  "/account",
  "/startup-validator",
  "/simulator",
];

/**
 * Optimistic check only (presence of the session cookie, not DB validation - Proxy runs on
 * every navigation including prefetches, so it must stay cheap). The real, DB-backed
 * authorization check happens in src/lib/auth/dal.ts's requireUserOrRedirect() / requireUserForApi(),
 * which every protected layout, Server Action and Route Handler calls - see docs/PHASE-4.md.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic(pathname) && hasSessionCookie && pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
