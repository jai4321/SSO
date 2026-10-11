import type { Metadata } from "next";
import { RegistrationForm } from "./components/registration-form";

export const metadata: Metadata = { title: "Register organization" };

export default function RegisterOrganizationPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <RegistrationForm />
    </main>
  );
}
