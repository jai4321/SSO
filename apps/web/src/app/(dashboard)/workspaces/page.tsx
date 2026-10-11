import type { Metadata } from "next";

export const metadata: Metadata = { title: "Workspaces" };

export default function WorkspacesPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <h1 className="text-2xl font-semibold">Workspaces</h1>
    </div>
  );
}
