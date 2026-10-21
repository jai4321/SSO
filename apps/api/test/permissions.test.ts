import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import type { FastifyRequest } from 'fastify';
import { permissionKeys, type PermissionKey } from '@/db/schema/permission';
import { requirePermission } from '@/guards/require-permission';
import { ForbiddenError, NotFoundError } from '@/errors/app-error';
import {
  assertCanAssignRole,
  assertCanCreateRole,
  assertCanManage,
  assertCanRemoveLastActiveSuperadmin,
  isSuperadminOverride,
  type UserPolicyActor,
  type UserPolicyTarget,
} from '@/modules/users/user-policy';

type Role = UserPolicyActor['organizationRole'];

const migration = readFileSync(new URL('../drizzle/0011_mature_garia.sql', import.meta.url), 'utf8');
const grantInsert = migration.slice(migration.indexOf('INSERT INTO "role_permissions"'));
const grants = Object.fromEntries(
  (['SUPERADMIN', 'ADMIN', 'MEMBER'] as const).map((role) => [role, new Set<string>()]),
) as Record<Role, Set<string>>;
for (const [, role, key] of grantInsert.matchAll(/\('((?:SUPERADMIN|ADMIN|MEMBER))', '([^']+)'\)/g)) {
  grants[role as Role].add(key);
}

const makeActor = (
  role: Role,
  overrides: Partial<UserPolicyActor> = {},
): UserPolicyActor => ({
  id: 'actor-1',
  organizationId: 'org-1',
  organizationRole: role,
  permissions: [...grants[role]],
  ...overrides,
});

const makeTarget = (overrides: Partial<UserPolicyTarget> = {}): UserPolicyTarget => ({
  id: 'target-1',
  organizationId: 'org-1',
  createdBy: 'actor-1',
  organizationRole: 'MEMBER',
  isActive: true,
  ...overrides,
});

test('migration seeds the fixed role grant matrix', () => {
  assert.deepEqual([...grants.SUPERADMIN].sort(), [...permissionKeys].sort());
  assert.deepEqual(
    [...grants.ADMIN].sort(),
    [
      'organization.users.read',
      'organization.users.create',
      'organization.users.manage',
      'workspace.create',
      'workspace.products.manage',
    ].sort(),
  );
  assert.deepEqual([...grants.MEMBER], ['workspace.products.manage']);
});

test('requirePermission enforces every seeded grant for each organization role', async () => {
  for (const role of ['SUPERADMIN', 'ADMIN', 'MEMBER'] as const) {
    for (const key of permissionKeys) {
      const request = {
        currentUser: { permissions: [...grants[role]] },
      } as unknown as FastifyRequest;
      const guard = requirePermission(key);

      if (grants[role].has(key)) {
        await assert.doesNotReject(guard(request));
      } else {
        await assert.rejects(guard(request), ForbiddenError);
      }
    }
  }
});

test('ADMIN user management is limited to users they created and their organization', () => {
  const admin = makeActor('ADMIN');
  assert.doesNotThrow(() => assertCanManage(admin, makeTarget()));
  assert.throws(
    () => assertCanManage(admin, makeTarget({ createdBy: 'another-admin' })),
    ForbiddenError,
  );
  assert.throws(
    () => assertCanManage(admin, makeTarget({ organizationId: 'other-org' })),
    NotFoundError,
  );
});

test('user creation and role assignment preserve the fixed role policy', () => {
  const superadmin = makeActor('SUPERADMIN');
  const admin = makeActor('ADMIN');
  const member = makeActor('MEMBER');

  for (const role of ['SUPERADMIN', 'ADMIN', 'MEMBER'] as const) {
    assert.doesNotThrow(() => assertCanCreateRole(superadmin, role));
  }
  assert.throws(() => assertCanCreateRole(admin, 'SUPERADMIN'), ForbiddenError);
  assert.doesNotThrow(() => assertCanCreateRole(admin, 'ADMIN'));
  assert.doesNotThrow(() => assertCanCreateRole(admin, 'MEMBER'));
  assert.throws(() => assertCanCreateRole(member, 'MEMBER'), ForbiddenError);

  assert.doesNotThrow(() => assertCanAssignRole(superadmin));
  assert.throws(() => assertCanAssignRole(admin), ForbiddenError);
  assert.throws(
    () => assertCanAssignRole(makeActor('SUPERADMIN', { permissions: [] })),
    ForbiddenError,
  );
});

test('last active SUPERADMIN cannot be removed or demoted', () => {
  const superadmin = makeTarget({ organizationRole: 'SUPERADMIN' });
  assert.throws(() => assertCanRemoveLastActiveSuperadmin(superadmin, 1), ForbiddenError);
  assert.doesNotThrow(() => assertCanRemoveLastActiveSuperadmin(superadmin, 2));
  assert.doesNotThrow(
    () => assertCanRemoveLastActiveSuperadmin(makeTarget({ organizationRole: 'ADMIN' }), 0),
  );
});

test('SUPERADMIN resource overrides are explicit and distinguishable', () => {
  assert.equal(isSuperadminOverride(makeActor('SUPERADMIN'), makeTarget({ createdBy: 'admin-2' })), true);
  assert.equal(isSuperadminOverride(makeActor('SUPERADMIN'), makeTarget()), false);
  assert.equal(
    isSuperadminOverride(makeActor('SUPERADMIN'), makeTarget({ id: 'actor-1', createdBy: null })),
    false,
  );
});

test('permission keys used by routes have a typed catalog', () => {
  const required: PermissionKey[] = [
    'organization.users.read',
    'organization.users.create',
    'organization.users.manage',
    'organization.users.assign_role',
    'workspace.create',
    'workspace.products.manage',
  ];
  assert.deepEqual(permissionKeys, required);
});
