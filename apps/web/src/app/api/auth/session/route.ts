import { z } from "zod";
import { withErrorHandler } from "@/lib/errors/with-error-handler";
import { clearSessionCookies, getSessionCookies, setSessionCookies } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors/app-error";

const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const POST = withErrorHandler(async (req: Request) => {
  const tokens = tokensSchema.parse(await req.json());
  await setSessionCookies(tokens);
  return Response.json({ ok: true });
});

export const DELETE = withErrorHandler(async () => {
  await clearSessionCookies();
  return Response.json({ ok: true });
});

export const GET = withErrorHandler(async () => {
  const { accessToken } = await getSessionCookies();
  if (!accessToken) throw new UnauthorizedError("No session");
  return Response.json({ authenticated: true });
});
