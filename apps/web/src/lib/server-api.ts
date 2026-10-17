import "server-only";

import { clientEnv } from "@/config/env";
import { AppError, UnauthorizedError } from "@/lib/errors/app-error";
import {
  clearSessionCookies,
  getSessionCookies,
  setSessionCookies,
  type SessionTokens,
} from "@/lib/session";
import { z } from "zod";

const sessionTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = await getSessionCookies();
  if (!refreshToken) {
    await clearSessionCookies();
    throw new UnauthorizedError("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (response.status === 401) {
    await clearSessionCookies();
    throw new UnauthorizedError("Your session has expired. Please sign in again.");
  }
  if (!response.ok) {
    throw new AppError(502, "SESSION_REFRESH_FAILED", "Could not refresh your session.");
  }

  const tokens = sessionTokensSchema.parse((await response.json()) as SessionTokens);
  await setSessionCookies(tokens);
  return tokens.accessToken;
}

export async function proxyApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();
  const contentType = request.headers.get("content-type");

  const send = (accessToken: string) => {
    const headers = new Headers({ authorization: `Bearer ${accessToken}` });
    if (contentType) headers.set("content-type", contentType);

    return fetch(`${clientEnv.NEXT_PUBLIC_API_URL}${url.pathname}${url.search}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
  };

  const { accessToken } = await getSessionCookies();
  let response = await send(accessToken ?? (await refreshAccessToken()));

  if (response.status === 401) {
    response = await send(await refreshAccessToken());
  }

  if (response.status === 401) {
    await clearSessionCookies();
  }

  return response;
}
