"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Building2,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ORGANIZATION_PERMISSION } from "@onesys/contracts/keys/organization-permissions";
import { useLogout } from "@/hooks/use-auth";
import { useCan } from "@/hooks/use-can";
import type { PermissionKey } from "@/lib/auth-permissions";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  requiredPermission?: PermissionKey;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/workspaces",
    label: "Workspaces",
    icon: Boxes,
    requiredPermission: ORGANIZATION_PERMISSION.manageWorkspaceProducts,
  },
  {
    href: "/products",
    label: "Products",
    icon: Package,
    requiredPermission: ORGANIZATION_PERMISSION.manageWorkspaceProducts,
  },
  {
    href: "/admin-users",
    label: "Admin Users",
    icon: UserCog,
    requiredPermission: ORGANIZATION_PERMISSION.readUsers,
  },
  {
    href: "/client-users",
    label: "Client Users",
    icon: Users,
    requiredPermission: ORGANIZATION_PERMISSION.manageWorkspaceProducts,
  },
  { href: "/profile", label: "Profile Settings", icon: Settings },
];

interface AppSidebarProps {
  /** Called after a nav/logout action so a mobile drawer can close. */
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();
  const canManageProducts = useCan(ORGANIZATION_PERMISSION.manageWorkspaceProducts);
  const canReadUsers = useCan(ORGANIZATION_PERMISSION.readUsers);
  const permittedItems = NAV_ITEMS.filter(({ requiredPermission }) => {
    if (!requiredPermission) return true;
    if (requiredPermission === ORGANIZATION_PERMISSION.manageWorkspaceProducts) return canManageProducts;
    if (requiredPermission === ORGANIZATION_PERMISSION.readUsers) return canReadUsers;
    return false;
  });

  return (
    <aside className="flex h-full w-72 max-w-[85vw] shrink-0 flex-col border-r bg-background md:w-64">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Building2 className="size-5" />
        <span className="flex-1 font-semibold">OneSysUser</span>
        {onNavigate && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            className="md:hidden"
            onClick={onNavigate}
          >
            <X />
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {permittedItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Button
              key={href}
              render={<Link href={href} />}
              nativeButton={false}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={onNavigate}
            >
              <Icon />
              {label}
            </Button>
          );
        })}
      </nav>
      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          disabled={logout.isPending}
          onClick={() => {
            onNavigate?.();
            logout.mutate();
          }}
        >
          <LogOut />
          {logout.isPending ? "Logging out…" : "Logout"}
        </Button>
      </div>
    </aside>
  );
}
