"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useRegisterOrganization, useResendVerification } from "@/hooks/use-organization";
import { ApiError } from "@/lib/api-client";
import { AddressSection } from "./address-section";
import { AdminAccountSection } from "./admin-account-section";
import { OrganizationDetailsSection } from "./organization-details-section";
import {
  registerOrganizationFormSchema,
  type RegisterOrganizationFormValues,
} from "../schemas";

export function RegistrationForm() {
  const registerOrganization = useRegisterOrganization();
  const resendVerification = useResendVerification();
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const form = useForm<RegisterOrganizationFormValues>({
    resolver: zodResolver(registerOrganizationFormSchema),
    defaultValues: {
      organizationName: "",
      contactNumber: "",
      address: { addressLine1: "", addressLine2: "", country: "", state: "", city: "", pincode: "" },
      user: { name: "", email: "" },
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerOrganization.mutateAsync(values);
      setRegisteredEmail(values.user.email);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Registration failed");
    }
  });

  if (registeredEmail) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to {registeredEmail}. Open it to confirm your organization
            and set your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Didn&apos;t receive the email?</p>
          <Button
            variant="outline"
            disabled={resendVerification.isPending}
            onClick={async () => {
              await resendVerification.mutateAsync(registeredEmail);
              toast.success("A new verification link has been sent if the address is registered.");
            }}
          >
            Resend verification email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Register your organization</CardTitle>
        <CardDescription>Create an organization and its administrator account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="grid gap-6">
            <OrganizationDetailsSection />
            <Separator />
            <AddressSection />
            <Separator />
            <AdminAccountSection />
            <Button type="submit" disabled={registerOrganization.isPending}>
              {registerOrganization.isPending ? "Registering…" : "Register organization"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
