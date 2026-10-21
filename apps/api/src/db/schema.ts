import { organizations } from './schema/organization';
import { users } from './schema/user';
import { workspaces } from './schema/workspace';
import { permissions, rolePermissions } from './schema/permission';
import { auditEvents } from './schema/audit-event';

export { organizations, users, workspaces, permissions, rolePermissions, auditEvents };

export const schema = { organizations, users, workspaces, permissions, rolePermissions, auditEvents };
