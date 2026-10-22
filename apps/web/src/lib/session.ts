import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAMES } from "@/config/keys/session-cookies";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export async function setSessionCookies(tokens: SessionTokens) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAMES.accessToken, tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 });
  store.set(SESSION_COOKIE_NAMES.refreshToken, tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getSessionCookies(): Promise<Partial<SessionTokens>> {
  const store = await cookies();
  return {
    accessToken: store.get(SESSION_COOKIE_NAMES.accessToken)?.value,
    refreshToken: store.get(SESSION_COOKIE_NAMES.refreshToken)?.value,
  };
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAMES.accessToken);
  store.delete(SESSION_COOKIE_NAMES.refreshToken);
}
