"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

// Responsive authenticated shell: static sidebar on md+, top bar + overlay drawer on mobile.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authAttempt, setAuthAttempt] = useState(0);
  const hasBootstrapped = useRef(false);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    if (user) {
      hasBootstrapped.current = true;
      return;
    }
    if (hasBootstrapped.current) return;

    let active = true;
    void fetchMe()
      .then(() => {
        if (active) {
          hasBootstrapped.current = true;
          setAuthError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setAuthError(error instanceof Error ? error.message : "Could not restore your session.");
        }
      });

    return () => {
      active = false;
    };
  }, [authAttempt, fetchMe, user]);

  if (!user && authError) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <section className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Your session could not be restored</h1>
          <p className="mt-2 text-muted-foreground">{authError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="outline" render={<Link href="/login" />} nativeButton={false}>
              Go to sign in
            </Button>
            <Button
              onClick={() => {
                setAuthError(null);
                setAuthAttempt((attempt) => attempt + 1);
              }}
            >
              Try again
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </Button>
        <span className="font-semibold">OneSysUser</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">{children}</main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-in bg-black/50 fade-in-0"
            aria-hidden
            onClick={closeSidebar}
          />
          <div className="absolute inset-y-0 left-0 animate-in slide-in-from-left duration-200">
            <AppSidebar onNavigate={closeSidebar} />
          </div>
        </div>
      )}
    </div>
  );
}
