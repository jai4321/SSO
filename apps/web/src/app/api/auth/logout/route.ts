import { clientEnv } from "@/config/env";
import { withErrorHandler } from "@/lib/errors/with-error-handler";
import { clearSessionCookies, getSessionCookies } from "@/lib/session";

export const POST = withErrorHandler(async () => {
  const { refreshToken } = await getSessionCookies();

  try {
    if (refreshToken) {
      const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      const body = await response.json().catch(() => ({ message: "Logged out" }));
      return Response.json(body, { status: response.status });
    }

    return Response.json({ message: "Logged out" });
  } finally {
    await clearSessionCookies();
  }
});
