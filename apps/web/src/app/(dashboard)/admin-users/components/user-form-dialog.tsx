"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { OrganizationRole } from "@/stores/auth-store";
import type { OrganizationUser } from "@/hooks/use-users";

export interface UserFormValues {
  name: string;
  email?: string;
  organizationRole?: OrganizationRole;
}

interface UserFormDialogProps {
  open: boolean;
  user: OrganizationUser | null;
  availableRoles: OrganizationRole[];
  allowRoleChange: boolean;
  roleChangeNote: string | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => void | Promise<void>;
}

const ROLE_LABELS: Record<OrganizationRole, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export function UserFormDialog({
  open,
  user,
  availableRoles,
  allowRoleChange,
  roleChangeNote,
  isPending,
  onOpenChange,
  onSubmit,
}: UserFormDialogProps) {
  const nameId = useId();
  const emailId = useId();
  const roleId = useId();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationRole>(
    user?.organizationRole ?? (availableRoles.includes("MEMBER") ? "MEMBER" : availableRoles[0] ?? "MEMBER"),
  );
  const isEditing = Boolean(user);
  const dialogStyle = {
    "--primary": "oklch(0.56 0.21 255)",
    "--primary-foreground": "oklch(0.99 0 0)",
  } as CSSProperties;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (user) {
      void onSubmit({
        name: trimmedName,
        ...(allowRoleChange ? { organizationRole: role } : {}),
      });
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !availableRoles.includes(role)) return;
    void onSubmit({ name: trimmedName, email: trimmedEmail, organizationRole: role });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={dialogStyle}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit user" : "Create user"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this organization user's details."
              : "Create an organization account. The user will receive an email to set their password."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={nameId}>Name</Label>
            <Input
              id={nameId}
              autoComplete="name"
              maxLength={150}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          {!isEditing && (
            <div className="grid gap-2">
              <Label htmlFor={emailId}>Email</Label>
              <Input
                id={emailId}
                type="email"
                autoComplete="email"
                maxLength={255}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor={roleId}>Organization role</Label>
            <Select
              value={role}
              onValueChange={(value) => {
                if (value && availableRoles.includes(value as OrganizationRole)) {
                  setRole(value as OrganizationRole);
                }
              }}
              disabled={isEditing ? !allowRoleChange : availableRoles.length <= 1}
            >
              <SelectTrigger id={roleId} className="w-full">
                <SelectValue>{ROLE_LABELS[role]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((availableRole) => (
                  <SelectItem key={availableRole} value={availableRole}>
                    {ROLE_LABELS[availableRole]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEditing && roleChangeNote && (
              <p className="text-xs text-muted-foreground">
                {roleChangeNote}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || availableRoles.length === 0}>
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
