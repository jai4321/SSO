import type { Metadata } from "next";
import { SetPasswordForm } from "@/components/set-password-form";

export const metadata: Metadata = { title: "Set password" };

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <SetPasswordForm token={typeof token === "string" ? token : undefined} />
    </main>
  );
}
