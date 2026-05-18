import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/products",
  "/events",
  "/anchors",
  "/qr-codes",
  "/api-keys",
  "/billing",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!requiresAuth) return NextResponse.next();

  const session = request.cookies.get("gf_session");
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/events/:path*",
    "/anchors/:path*",
    "/qr-codes/:path*",
    "/api-keys/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};
