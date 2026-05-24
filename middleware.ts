import { NextRequest, NextResponse } from "next/server";

/**
 * Maintenance gate.
 *
 * Default: every visitor sees the branded maintenance page.
 *
 * Re-opening the public site: set env var SITE_LIVE=true in Vercel and
 * redeploy. To put it back into maintenance: remove the env var (or set to
 * anything other than "true") and redeploy.
 *
 * Owner bypass: visiting any URL with ?unlock=<UNLOCK_KEY> sets a long-lived
 * cookie; further visits in the same browser go straight to the real app
 * (no need to redeploy or touch env vars).
 */

const UNLOCK_KEY = "ra-owner-7vK9Lq3xPmN2";
const COOKIE_NAME = "ra_unlock";

export function middleware(req: NextRequest) {
  if (process.env.SITE_LIVE === "true") {
    return NextResponse.next();
  }

  const { pathname, searchParams } = req.nextUrl;

  if (
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.png" ||
    pathname === "/logo.jpg" ||
    pathname === "/logo2.png" ||
    pathname === "/logo3.png" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  if (searchParams.get("unlock") === UNLOCK_KEY) {
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete("unlock");
    const res = NextResponse.redirect(cleanUrl);
    res.cookies.set(COOKIE_NAME, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }

  if (req.cookies.get(COOKIE_NAME)?.value === "1") {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/maintenance", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
