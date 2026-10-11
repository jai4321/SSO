import type { Metadata } from "next";
import { VerifyToken } from "./components/verify-token";

export const metadata: Metadata = { title: "Verify organization" };

export default async function VerifyOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <VerifyToken token={typeof token === "string" ? token : undefined} />
    </main>
  );
}
