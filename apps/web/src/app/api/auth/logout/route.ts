import { clientEnv } from "@/config/env";
import { createRouteHandlers } from "@/lib/errors/with-error-handler";
import { clearSessionCookies, getSessionCookies } from "@/lib/session";

const handlers = createRouteHandlers({
  POST: async () => {
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
  },
});

export const POST = handlers.POST;
