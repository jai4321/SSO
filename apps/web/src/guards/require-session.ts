import "server-only";
import { redirect } from "next/navigation";
import { getSessionCookies } from "@/lib/session";

// UX guard only: cookie presence avoids rendering protected pages when signed out.
// Authenticated API requests validate and refresh the session on the server.
export async function requireSession() {
  const { refreshToken } = await getSessionCookies();
  if (!refreshToken) redirect("/login");
}
