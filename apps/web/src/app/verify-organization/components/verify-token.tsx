"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SetPasswordForm } from "@/components/set-password-form";
import { useVerifyOrganization } from "@/hooks/use-organization";
import { ApiError } from "@/lib/api-client";

export function VerifyToken({ token }: { token?: string }) {
  const verify = useVerifyOrganization();
  const [setPasswordToken, setSetPasswordToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // React Strict Mode mounts effects twice in dev; verify is one-shot so only run it once.
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    verify
      .mutateAsync(token)
      .then((data) => setSetPasswordToken(data.setPasswordToken))
      .catch((error: unknown) =>
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Verification link is invalid or has expired",
        ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (setPasswordToken) return <SetPasswordForm token={setPasswordToken} />;

  if (!token || errorMessage) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verification failed</CardTitle>
          <CardDescription>
            {errorMessage ?? "This verification link is missing a token."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/register-organization" />} nativeButton={false} variant="outline" className="w-full">
            Back to registration
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verifying your organization…</CardTitle>
        <CardDescription>This will only take a moment.</CardDescription>
      </CardHeader>
    </Card>
  );
}
