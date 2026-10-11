"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";

// Responsive authenticated shell: static sidebar on md+, top bar + overlay drawer on mobile.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

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
