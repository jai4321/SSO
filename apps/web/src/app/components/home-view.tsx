"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export function HomeView() {
  const { user, accessToken, fetchMe } = useAuthStore();
  const logout = useLogout();
  const router = useRouter();

  useEffect(() => {
    if (accessToken && !user) {
      fetchMe().catch(() => toast.error("Could not load your account"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>OneSysUser</CardTitle>
          <CardDescription>
            Organization access management. Register your organization or sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button render={<Link href="/register-organization" />} nativeButton={false} className="flex-1">
            Register
          </Button>
          <Button render={<Link href="/login" />} nativeButton={false} variant="outline" className="flex-1">
            Sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Signed in as {user.organizationRole} of organization {user.organizationId}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          Sign out
        </Button>
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => router.refresh()}
        >
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
