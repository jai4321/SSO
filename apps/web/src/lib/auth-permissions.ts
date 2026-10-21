import { z } from 'zod';

export const permissionKeys = [
  'organization.users.read',
  'organization.users.create',
  'organization.users.manage',
  'organization.users.assign_role',
  'workspace.create',
  'workspace.products.manage',
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

const organizationRoleSchema = z.enum(['SUPERADMIN', 'ADMIN', 'MEMBER']);
const permissionKeySchema = z.enum(permissionKeys);
const permissionListSchema = z.array(permissionKeySchema);

export const authUserSchema = z
  .object({
    id: z.string().min(1),
    organizationId: z.string().min(1),
    organizationRole: organizationRoleSchema,
    permissions: z.unknown().optional(),
  })
  .transform((user) => {
    const parsedPermissions = permissionListSchema.safeParse(user.permissions);

    return {
      ...user,
      permissions: parsedPermissions.success ? parsedPermissions.data : [],
    };
  });

export type AuthUser = z.infer<typeof authUserSchema>;
