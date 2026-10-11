import type { Metadata } from "next";

export const metadata: Metadata = { title: "Client Users" };

export default function ClientUsersPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <h1 className="text-2xl font-semibold">Client Users</h1>
    </div>
  );
}
