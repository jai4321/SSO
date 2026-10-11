"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSetPassword } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { setPasswordFormSchema, type SetPasswordFormValues } from "../schemas";

export function SetPasswordForm({ setPasswordToken }: { setPasswordToken: string }) {
  const setPassword = useSetPassword();
  const [done, setDone] = useState(false);

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    try {
      await setPassword.mutateAsync({ token: setPasswordToken, password });
      setDone(true);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not set password");
    }
  });

  if (done) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password set</CardTitle>
          <CardDescription>Your administrator account is ready.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/login" />} nativeButton={false} className="w-full">
            Continue to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Organization verified</CardTitle>
        <CardDescription>
          Set a password for your administrator account to finish setup. This link expires soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="grid gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={setPassword.isPending}>
              {setPassword.isPending ? "Saving…" : "Set password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
