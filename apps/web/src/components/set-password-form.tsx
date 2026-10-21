"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSetPassword } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";

const setPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72)
      .regex(/[a-zA-Z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a digit"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SetPasswordFormValues = z.infer<typeof setPasswordFormSchema>;

export function SetPasswordForm({ token }: { token?: string }) {
  const setPassword = useSetPassword();
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    if (!token) return;
    setErrorMessage(null);

    try {
      await setPassword.mutateAsync({ token, password });
      setDone(true);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not set password");
    }
  });

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password link unavailable</CardTitle>
          <CardDescription>
            This link is missing its token. Contact your organization administrator and ask them to resend the invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/login" />} nativeButton={false} variant="outline" className="w-full">
            Return to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password set</CardTitle>
          <CardDescription>Your account is ready. You can now sign in.</CardDescription>
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
        <CardTitle>Set your password</CardTitle>
        <CardDescription>Choose a password for your account to finish setup.</CardDescription>
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
            {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
            <Button type="submit" disabled={setPassword.isPending}>
              {setPassword.isPending ? "Saving…" : "Set password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
