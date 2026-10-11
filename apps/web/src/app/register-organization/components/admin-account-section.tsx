"use client";

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { RegisterOrganizationFormValues } from "../schemas";

export function AdminAccountSection() {
  const { control } = useFormContext<RegisterOrganizationFormValues>();

  return (
    <section className="grid gap-4">
      <h2 className="text-lg font-semibold">Administrator account</h2>
      <p className="text-sm text-muted-foreground">
        This person becomes the SUPERADMIN of the organization. A verification email will be
        sent to this address — no password is needed yet.
      </p>
      <FormField
        control={control}
        name="user.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full name</FormLabel>
            <FormControl>
              <Input placeholder="Jane Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="user.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="jane@acme.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
