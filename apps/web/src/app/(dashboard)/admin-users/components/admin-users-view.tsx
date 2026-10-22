"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { ORGANIZATION_PERMISSION } from "@onesys/contracts/keys/organization-permissions";
import type { DataTableQuery } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  useCreateOrganizationUser,
  useDeleteOrganizationUser,
  useOrganizationUsers,
  useSetOrganizationUserActive,
  useUpdateOrganizationUser,
  type CreateOrganizationUserInput,
  type OrganizationUser,
} from "@/hooks/use-users";
import { useAuthStore, type OrganizationRole } from "@/stores/auth-store";
import { useCan } from "@/hooks/use-can";
import { UserFormDialog, type UserFormValues } from "./user-form-dialog";
import { UsersTable } from "./users-table";

const PAGE_SIZE = 5;
const ADMIN_ROLES: OrganizationRole[] = ["ADMIN", "MEMBER"];
const SUPERADMIN_ROLES: OrganizationRole[] = ["SUPERADMIN", "ADMIN", "MEMBER"];

type RoleFilter = OrganizationRole | "all";
type StatusFilter = "active" | "inactive" | "all";

const messageFrom = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function AdminUsersView() {
  const user = useAuthStore((state) => state.user);
  const canViewUsers = useCan(ORGANIZATION_PERMISSION.readUsers);
  const canCreateUsers = useCan(ORGANIZATION_PERMISSION.createUsers);
  const canManageUsers = useCan(ORGANIZATION_PERMISSION.manageUsers);
  const canAssignRoles = useCan(ORGANIZATION_PERMISSION.assignUserRoles);
  const [tableQuery, setTableQuery] = useState<DataTableQuery>({
    search: "",
    filters: { role: "all", status: "all" },
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(
    null,
  );
  const [formSession, setFormSession] = useState(0);

  const search = tableQuery.search;
  const roleFilter = (tableQuery.filters.role ?? "all") as RoleFilter;
  const statusFilter = (tableQuery.filters.status ?? "all") as StatusFilter;
  const page = tableQuery.page;
  const query = useMemo(
    () => ({
      page: tableQuery.page,
      limit: tableQuery.pageSize,
      ...(search ? { search } : {}),
      ...(roleFilter !== "all" ? { organizationRole: roleFilter } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    }),
    [roleFilter, search, statusFilter, tableQuery.page, tableQuery.pageSize],
  );
  const usersQuery = useOrganizationUsers(query, Boolean(canViewUsers));
console.log('this is userQuery',usersQuery);
  const createUser = useCreateOrganizationUser();
  const updateUser = useUpdateOrganizationUser();
  const setUserActive = useSetOrganizationUserActive();
  const deleteUser = useDeleteOrganizationUser();
  const isActionPending =
    createUser.isPending ||
    updateUser.isPending ||
    setUserActive.isPending ||
    deleteUser.isPending;

  const total = usersQuery.data?.total ?? 0;
  const users = usersQuery.data?.users ?? [];

  const openCreateDialog = () => {
    setSelectedUser(null);
    setFormSession((session) => session + 1);
    setFormOpen(true);
  };

  const openEditDialog = (target: OrganizationUser) => {
    setSelectedUser(target);
    setFormSession((session) => session + 1);
    setFormOpen(true);
  };

  const matchesCurrentFilters = (target: OrganizationUser) => {
    const matchesRole =
      roleFilter === "all" || target.organizationRole === roleFilter;
    const matchesStatus =
      statusFilter === "all" || (statusFilter === "active") === target.isActive;
    const normalizedSearch = search.toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      target.name.toLowerCase().includes(normalizedSearch) ||
      target.email.toLowerCase().includes(normalizedSearch);
    return matchesRole && matchesStatus && matchesSearch;
  };

  const moveBackIfLastVisibleRowLeaves = (willRemain: boolean) => {
    if (!willRemain && users.length === 1 && page > 1) {
      setTableQuery((current) => ({
        ...current,
        page: Math.max(1, current.page - 1),
      }));
    }
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    if (!user) return;
    try {
      if (selectedUser) {
        const updatedUser = {
          ...selectedUser,
          name: values.name,
          organizationRole:
            values.organizationRole ?? selectedUser.organizationRole,
        };
        await updateUser.mutateAsync({
          id: selectedUser.id,
          name: values.name,
          ...(values.organizationRole
            ? { organizationRole: values.organizationRole }
            : {}),
        });
        moveBackIfLastVisibleRowLeaves(matchesCurrentFilters(updatedUser));
        toast.success("User updated.");
      } else {
        if (!values.email || !values.organizationRole) return;
        const input: CreateOrganizationUserInput = {
          name: values.name,
          email: values.email,
          organizationRole: values.organizationRole,
        };
        await createUser.mutateAsync(input);
        toast.success("User created. An invitation email has been sent.");
      }
      setFormOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(
        messageFrom(
          error,
          selectedUser ? "Could not update user." : "Could not create user.",
        ),
      );
    }
  };

  const handleSetActive = async (
    target: OrganizationUser,
    isActive: boolean,
  ) => {
    try {
      await setUserActive.mutateAsync({ id: target.id, isActive });
      moveBackIfLastVisibleRowLeaves(
        matchesCurrentFilters({ ...target, isActive }),
      );
      toast.success(isActive ? "User activated." : "User deactivated.");
    } catch (error) {
      toast.error(
        messageFrom(
          error,
          isActive ? "Could not activate user." : "Could not deactivate user.",
        ),
      );
    }
  };

  const handleDelete = async (target: OrganizationUser) => {
    if (!window.confirm(`Delete ${target.name}? This action cannot be undone.`))
      return;
    try {
      await deleteUser.mutateAsync(target.id);
      moveBackIfLastVisibleRowLeaves(false);
      toast.success("User deleted.");
    } catch (error) {
      toast.error(messageFrom(error, "Could not delete user."));
    }
  };

  const pageStyle = {
    "--primary": "oklch(0.56 0.21 255)",
    "--primary-foreground": "oklch(0.99 0 0)",
  } as CSSProperties;

  if (user && !canViewUsers) {
    return (
      <section className="grid flex-1 place-items-center" style={pageStyle}>
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Admin Users</h1>
          <p className="mt-2 text-muted-foreground">
            You do not have permission to manage organization users.
          </p>
          <Button
            variant="outline"
            className="mt-5"
            render={<Link href="/dashboard" />}
            nativeButton={false}
          >
            Return to dashboard
          </Button>
        </div>
      </section>
    );
  }

  const availableRoles =
    !canCreateUsers
      ? []
      : user?.organizationRole === "SUPERADMIN"
      ? SUPERADMIN_ROLES
      : user?.organizationRole === "ADMIN"
        ? ADMIN_ROLES
        : [];
  const canChangeSelectedRole =
    canManageUsers &&
    canAssignRoles &&
    user?.organizationRole === "SUPERADMIN" &&
    selectedUser?.id !== user.id;
  const roleChangeNote =
    user && selectedUser
      ? selectedUser.id === user.id
        ? "You cannot change your own organization role."
        : !canManageUsers
          ? "You do not have permission to manage organization users."
        : !canAssignRoles || user.organizationRole !== "SUPERADMIN"
          ? "Only a Super Admin can change organization roles."
          : null
      : null;
  const listError = usersQuery.error
    ? messageFrom(usersQuery.error, "Could not load organization users.")
    : undefined;

  return (
    <section
      className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6"
      style={pageStyle}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              href="/dashboard"
              className="font-medium text-primary hover:underline"
            >
              Dashboard
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Admin Users</span>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Admin Users
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Manage organization users and their roles.
          </p>
        </div>
        {canCreateUsers && (
          <Button
            className="h-11 gap-2 px-5"
            onClick={openCreateDialog}
            disabled={!user || isActionPending}
          >
            <Plus className="size-4" />
            Create User
          </Button>
        )}
      </div>

      <UsersTable
        users={users}
        query={tableQuery}
        onQueryChange={setTableQuery}
        total={total}
        currentUserId={user?.id ?? ""}
        currentRole={user?.organizationRole ?? "MEMBER"}
        canManageUsers={canManageUsers}
        isLoading={!user || usersQuery.isLoading}
        isFetching={usersQuery.isFetching}
        isPending={isActionPending}
        errorMessage={listError}
        onRetry={() => void usersQuery.refetch()}
        onEdit={openEditDialog}
        onSetActive={(target, active) => void handleSetActive(target, active)}
        onDelete={(target) => void handleDelete(target)}
      />

      <UserFormDialog
        key={formSession}
        open={formOpen}
        user={selectedUser}
        availableRoles={availableRoles}
        allowRoleChange={canChangeSelectedRole}
        roleChangeNote={roleChangeNote}
        isPending={createUser.isPending || updateUser.isPending}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
      />
    </section>
  );
}
