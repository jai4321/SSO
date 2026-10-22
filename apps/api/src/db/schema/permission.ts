import { sql } from 'drizzle-orm';
import { check, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import {
  organizationPermissionKeys as permissionKeys,
  type OrganizationPermissionKey,
} from '@onesys/contracts/keys/organization-permissions';
import { organizationRoleEnum } from './user';

export { permissionKeys };
export type PermissionKey = OrganizationPermissionKey;

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
