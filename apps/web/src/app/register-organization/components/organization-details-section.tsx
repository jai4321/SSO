"use client";

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { RegisterOrganizationFormValues } from "../schemas";

export function OrganizationDetailsSection() {
  const { control } = useFormContext<RegisterOrganizationFormValues>();

  return (
    <section className="grid gap-4">
      <h2 className="text-lg font-semibold">Organization details</h2>
      <FormField
        control={control}
        name="organizationName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization name</FormLabel>
            <FormControl>
              <Input placeholder="Acme Inc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="contactNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact number</FormLabel>
            <FormControl>
              <Input placeholder="+1 555 0100" maxLength={12} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
