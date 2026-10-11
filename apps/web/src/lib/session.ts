import "server-only";
import { cookies } from "next/headers";

const ACCESS_COOKIE = "onesys_access_token";
const REFRESH_COOKIE = "onesys_refresh_token";

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
  store.set(ACCESS_COOKIE, tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 });
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getSessionCookies(): Promise<Partial<SessionTokens>> {
  const store = await cookies();
  return {
    accessToken: store.get(ACCESS_COOKIE)?.value,
    refreshToken: store.get(REFRESH_COOKIE)?.value,
  };
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
