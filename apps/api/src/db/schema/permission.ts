import { sql } from 'drizzle-orm';
import { check, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { organizationRoleEnum } from './user';

export const permissionKeys = [
  'organization.users.read',
  'organization.users.create',
  'organization.users.manage',
  'organization.users.assign_role',
  'workspace.create',
  'workspace.products.manage',
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

export const permissions = pgTable(
  'permissions',
  {
    key: text('key').primaryKey(),
    scope: text('scope').notNull(),
    description: text('description').notNull(),
  },
  (table) => [
    check(
      'permissions_scope_check',
      sql`${table.scope} in ('organization', 'workspace', 'product')`,
    ),
  ],
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    role: organizationRoleEnum('role').notNull(),
    permissionKey: text('permission_key')
      .notNull()
      .references(() => permissions.key, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.role, table.permissionKey] })],
);
