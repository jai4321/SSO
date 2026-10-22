import { ForbiddenError, NotFoundError } from '@/errors/app-error';
import { ORGANIZATION_PERMISSION } from '@onesys/contracts/keys/organization-permissions';
import type { OrganizationRole } from '@/types/fastify-jwt';

export interface UserPolicyActor {
  id: string;
  organizationId: string;
  organizationRole: OrganizationRole;
  permissions: string[];
}

export interface UserPolicyTarget {
  id: string;
  organizationId: string;
  createdBy: string | null;
  organizationRole: OrganizationRole;
  isActive: boolean;
}

export function assertCanCreateRole(actor: UserPolicyActor, role: OrganizationRole) {
  if (actor.organizationRole === 'SUPERADMIN') return;
  if (actor.organizationRole === 'ADMIN' && (role === 'ADMIN' || role === 'MEMBER')) return;
  throw new ForbiddenError('You do not have permission to create a user with this role');
}

export function assertCanManage(actor: UserPolicyActor, target: UserPolicyTarget) {
  if (actor.organizationId !== target.organizationId) throw new NotFoundError('User not found');
  if (actor.organizationRole === 'SUPERADMIN') return;
  if (actor.organizationRole === 'ADMIN' && target.createdBy === actor.id) return;
  throw new ForbiddenError('You do not have permission to manage this user');
}

export function assertCanAssignRole(actor: UserPolicyActor) {
  if (
    actor.organizationRole !== 'SUPERADMIN' ||
    !actor.permissions.includes(ORGANIZATION_PERMISSION.assignUserRoles)
  ) {
    throw new ForbiddenError('Only SUPERADMIN can change organization roles');
  }
}

export function assertNotSelf(actor: UserPolicyActor, target: UserPolicyTarget, action: string) {
  if (target.id === actor.id) throw new ForbiddenError(`You cannot ${action} your own account`);
}

export function assertCanRemoveLastActiveSuperadmin(target: UserPolicyTarget, activeCount: number) {
  if (
    target.organizationRole === 'SUPERADMIN' &&
    target.isActive &&
    activeCount <= 1
  ) {
    throw new ForbiddenError('The organization must keep at least one active SUPERADMIN');
  }
}

export function isSuperadminOverride(actor: UserPolicyActor, target: UserPolicyTarget) {
  return actor.organizationRole === 'SUPERADMIN' && target.id !== actor.id && target.createdBy !== actor.id;
}
