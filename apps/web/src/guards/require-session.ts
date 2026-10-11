import "server-only";
import { redirect } from "next/navigation";
import { getSessionCookies } from "@/lib/session";

// Server-component guard for protected pages: redirects to /login when no session cookie exists.
// UX only — the API enforces the real authorization boundary.
export async function requireSession() {
  const { refreshToken } = await getSessionCookies();
  if (!refreshToken) redirect("/login");
}
