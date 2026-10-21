"use client";

import { MoreVertical, Pencil, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn, type DataTableQuery } from "@/components/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrganizationUser } from "@/hooks/use-users";
import type { OrganizationRole } from "@/stores/auth-store";

interface UsersTableProps {
  users: OrganizationUser[];
  query: DataTableQuery;
  onQueryChange: (query: DataTableQuery) => void;
  total: number;
  currentUserId: string;
  currentRole: OrganizationRole;
  canManageUsers: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isPending: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onEdit: (user: OrganizationUser) => void;
  onSetActive: (user: OrganizationUser, isActive: boolean) => void;
  onDelete: (user: OrganizationUser) => void;
}

const ROLE_LABELS: Record<OrganizationRole, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  MEMBER: "Member",
};

const ROLE_STYLES: Record<OrganizationRole, string> = {
  SUPERADMIN: "bg-primary/10 text-primary",
  ADMIN: "bg-accent text-accent-foreground",
  MEMBER: "bg-muted text-muted-foreground",
};

const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "All roles" },
  ...(["SUPERADMIN", "ADMIN", "MEMBER"] as OrganizationRole[]).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  })),
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const formatCreatedAt = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

export function UsersTable({
  users,
  query,
  onQueryChange,
  total,
  currentUserId,
  currentRole,
  canManageUsers,
  isLoading,
  isFetching,
  isPending,
  errorMessage,
  onRetry,
  onEdit,
  onSetActive,
  onDelete,
}: UsersTableProps) {
  const columns: DataTableColumn<OrganizationUser>[] = [
    {
      id: "user",
      header: "User",
      headerClassName: "px-5",
      className: "px-5",
      cell: (user) => (
        <div className="flex min-w-48 items-center gap-3">
          <Avatar className="size-10 bg-primary/10 text-primary">
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {initialsFor(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{user.name}</span>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      className: "text-muted-foreground",
      cell: (user) => user.email,
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => (
        <Badge className={`h-8 rounded-md border-0 px-3 text-xs font-medium ${ROLE_STYLES[user.organizationRole]}`}>
          {ROLE_LABELS[user.organizationRole]}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => (
        <Badge
          className={
            user.isActive
              ? "h-8 gap-2 rounded-md border-0 bg-success-soft px-3 text-success"
              : "h-8 gap-2 rounded-md border-0 bg-destructive/10 px-3 text-destructive"
          }
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${user.isActive ? "bg-success" : "bg-destructive"}`}
          />
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Created on",
      className: "text-muted-foreground",
      cell: (user) => formatCreatedAt(user.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "px-5 text-right",
      className: "px-5",
      cell: (user) => {
        const canManage =
          canManageUsers &&
          (currentRole === "SUPERADMIN" || user.createdBy === currentUserId);
        const isSelf = user.id === currentUserId;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="h-10 gap-2 px-4"
              disabled={!canManage || isPending}
              onClick={() => onEdit(user)}
              aria-label={`Edit ${user.name}`}
              title={canManage ? `Edit ${user.name}` : "You can manage users you created"}
            >
              <Pencil className="size-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!canManage || isSelf || isPending}
                    aria-label={`More actions for ${user.name}`}
                    title={canManage ? `More actions for ${user.name}` : "You can manage users you created"}
                  />
                }
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={!canManage || isSelf || isPending}
                  onClick={() => onSetActive(user, !user.isActive)}
                >
                  {user.isActive ? <ShieldOff /> : <ShieldCheck />}
                  {user.isActive ? "Deactivate user" : "Activate user"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={!canManage || isSelf || isPending}
                  onClick={() => onDelete(user)}
                >
                  <Trash2 />
                  Delete user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      getRowId={(user) => user.id}
      query={query}
      onQueryChange={onQueryChange}
      totalItems={total}
      filters={[
        { id: "role", label: "role", options: ROLE_FILTER_OPTIONS },
        { id: "status", label: "status", options: STATUS_FILTER_OPTIONS },
      ]}
      searchPlaceholder="Search by name or email"
      searchLabel="Search users by name or email"
      itemLabel={{ singular: "user", plural: "users" }}
      isLoading={isLoading}
      isFetching={isFetching}
      errorMessage={errorMessage}
      onRetry={onRetry}
      emptyMessage="No users match these filters."
    />
  );
}
