import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Users" };

export default function AdminUsersPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <h1 className="text-2xl font-semibold">Admin Users</h1>
    </div>
  );
}
