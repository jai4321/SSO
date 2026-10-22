import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAMES } from "@/config/keys/session-cookies";

const AUTH_PAGES = ["/login", "/register-organization", "/verify-organization"];

// Optimistic check only: cookie presence, no token validation (the API remains the boundary).
export function sessionCheck(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE_NAMES.refreshToken)?.value);

  if (hasSession && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}
