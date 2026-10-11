import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/guards/require-session";

// Authenticated app shell: guards every route in this group and renders the shared sidebar.
export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return <DashboardShell>{children}</DashboardShell>;
}
