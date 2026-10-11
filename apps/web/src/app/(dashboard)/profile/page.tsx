import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile Settings" };

export default function ProfilePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <h1 className="text-2xl font-semibold">Profile Settings</h1>
    </div>
  );
}
