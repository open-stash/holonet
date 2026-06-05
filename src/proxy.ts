import { NextRequest, NextResponse } from "next/server";

// Routes that require a logged-in user
const PROTECTED = ["/dashboard", "/settings"];

// Auth pages — logged-in users should not see these
const AUTH_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Treat refresh_token cookie as the auth signal.
  // Sentinel sets it on login; it's httpOnly so JS can't forge it.
  const isLoggedIn = !!req.cookies.get("refresh_token")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Not logged in → trying to access a protected route → send to login
  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname); // preserve intended destination
    return NextResponse.redirect(url);
  }

  // Already logged in → trying to access an auth page → send to dashboard
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Root / → redirect based on auth state
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/dashboard" : "/login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api/* (proxy routes)
     * - /_next/static, /_next/image (Next.js internals)
     * - /favicon.ico and static public assets
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
