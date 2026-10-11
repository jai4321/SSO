import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register-organization", "/verify-organization"];

// Optimistic check only: cookie presence, no token validation (the API remains the boundary).
export function sessionCheck(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("onesys_refresh_token")?.value);

  if (hasSession && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}
