import { clientEnv } from "@/config/env";
import { withErrorHandler } from "@/lib/errors/with-error-handler";
import { setSessionCookies } from "@/lib/session";
import { z } from "zod";

const sessionTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const POST = withErrorHandler(async (request: Request) => {
  const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: await request.text(),
    cache: "no-store",
  });

  if (!response.ok) return response;

  const tokens = sessionTokensSchema.parse(await response.json());
  await setSessionCookies(tokens);

  // Tokens stay in HttpOnly cookies and are never returned to browser JavaScript.
  return Response.json({ ok: true });
});
