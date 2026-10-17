import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { and, count, desc, eq, ilike, isNull, or } from 'drizzle-orm';
import { env } from '@/config/env';
import { organizations, users } from '@/db/schema';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '@/errors/app-error';
import { db } from '@/lib/db';
import { sendMail } from '@/lib/mailer';
import { isUniqueViolation } from '@/lib/pg-errors';
import { redis } from '@/lib/redis';
import type { OrganizationRole } from '@/types/fastify-jwt';
import { buildInvitationEmail } from './users.email';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './users.schema';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
const inviteTtlHours = () => Math.round(env.USER_INVITE_TOKEN_TTL_SECONDS / 3600);

export interface Actor {
  id: string;
  organizationId: string;
  organizationRole: OrganizationRole;
}

type UserRow = typeof users.$inferSelect;

// Explicit whitelist so passwordHash/deletedAt never leak to API consumers.
const toPublicUser = (row: UserRow) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  organizationRole: row.organizationRole,
  isActive: row.isActive,
  createdBy: row.createdBy,
  createdAt: row.createdAt,
});

const findOrgUser = async (organizationId: string, id: string) => {
  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), eq(users.organizationId, organizationId), isNull(users.deletedAt)))
    .limit(1);
  return row;
};

const getOrganizationName = async (organizationId: string) => {
  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  return org?.name ?? 'your organization';
};

// Creation policy: SUPERADMIN may assign any role; ADMIN may assign ADMIN or MEMBER; MEMBER cannot create.
const assertCanCreateRole = (actor: Actor, role: OrganizationRole) => {
  if (actor.organizationRole === 'SUPERADMIN') return;
  if (actor.organizationRole === 'ADMIN' && (role === 'ADMIN' || role === 'MEMBER')) return;
  throw new ForbiddenError('You do not have permission to create a user with this role');
};

// Manage policy: SUPERADMIN manages everyone; ADMIN manages only users they created.
const assertCanManage = (actor: Actor, target: UserRow) => {
  if (actor.organizationRole === 'SUPERADMIN') return;
  if (actor.organizationRole === 'ADMIN' && target.createdBy === actor.id) return;
  throw new ForbiddenError('You do not have permission to manage this user');
};

const assertNotSelf = (actor: Actor, target: UserRow, action: string) => {
  if (target.id === actor.id) throw new ForbiddenError(`You cannot ${action} your own account`);
};

// Deactivating, deleting or demoting the last active SUPERADMIN would lock the organization out.
const assertNotLastActiveSuperadmin = async (target: UserRow) => {
  if (target.organizationRole !== 'SUPERADMIN' || !target.isActive) return;
  const [{ value }] = await db
    .select({ value: count() })
    .from(users)
    .where(
      and(
        eq(users.organizationId, target.organizationId),
        eq(users.organizationRole, 'SUPERADMIN'),
        eq(users.isActive, true),
        isNull(users.deletedAt),
      ),
    );
  if (value <= 1) {
    throw new ForbiddenError('The organization must keep at least one active SUPERADMIN');
  }
};

const sendInvitationMail = async (user: { id: string; name: string; email: string }, organizationId: string) => {
  const token = randomBytes(32).toString('hex');
  await redis.set(`set-password:${hashToken(token)}`, user.id, 'EX', env.USER_INVITE_TOKEN_TTL_SECONDS);
  const organizationName = await getOrganizationName(organizationId);
  await sendMail({
    to: user.email,
    ...buildInvitationEmail({
      organizationName,
      userName: user.name,
      inviteUrl: `${env.WEB_APP_URL}/set-password?token=${token}`,
      expiresInHours: inviteTtlHours(),
    }),
  });
};

export async function createUser(actor: Actor, input: CreateUserInput) {
  assertCanCreateRole(actor, input.organizationRole);

  const userId = randomUUID();
  const inviteToken = randomBytes(32).toString('hex');
  await redis.set(`set-password:${hashToken(inviteToken)}`, userId, 'EX', env.USER_INVITE_TOKEN_TTL_SECONDS);

  const organizationName = await getOrganizationName(actor.organizationId);

  try {
    // The email is sent inside the transaction so a delivery failure rolls the user back.
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        organizationId: actor.organizationId,
        name: input.name,
        email: input.email,
        organizationRole: input.organizationRole,
        createdBy: actor.id,
      });
      await sendMail({
        to: input.email,
        ...buildInvitationEmail({
          organizationName,
          userName: input.name,
          inviteUrl: `${env.WEB_APP_URL}/set-password?token=${inviteToken}`,
          expiresInHours: inviteTtlHours(),
        }),
      });
    });
  } catch (err) {
    // Emails are globally unique among non-deleted users (index from task 1.1).
    if (isUniqueViolation(err, 'users_email_unique')) {
      throw new ConflictError('This email is already registered');
    }
    throw err;
  }

  const created = await findOrgUser(actor.organizationId, userId);
  return toPublicUser(created!);
}

export async function listUsers(actor: Actor, query: ListUsersQuery) {
  const filters = [eq(users.organizationId, actor.organizationId), isNull(users.deletedAt)];

  if (query.search) {
    const escapedSearch = query.search.replace(/[\\%_]/g, '\\$&');
    const pattern = `%${escapedSearch}%`;
    filters.push(or(ilike(users.name, pattern), ilike(users.email, pattern))!);
  }

  if (query.organizationRole) {
    filters.push(eq(users.organizationRole, query.organizationRole));
  }

  if (query.status) {
    filters.push(eq(users.isActive, query.status === 'active'));
  }

  const where = and(...filters);

  const [{ value: total }] = await db.select({ value: count() }).from(users).where(where);
  const rows = await db
    .select()
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  return { users: rows.map(toPublicUser), total, page: query.page, limit: query.limit };
}

export async function getUser(actor: Actor, id: string) {
  const target = await findOrgUser(actor.organizationId, id);
  if (!target) throw new NotFoundError('User not found');
  return toPublicUser(target);
}

export async function updateUser(actor: Actor, id: string, input: UpdateUserInput) {
  const target = await findOrgUser(actor.organizationId, id);
  if (!target) throw new NotFoundError('User not found');
  assertCanManage(actor, target);

  const updates: { name?: string; organizationRole?: OrganizationRole } = {};
  if (input.name !== undefined && input.name !== target.name) updates.name = input.name;

  if (input.organizationRole !== undefined && input.organizationRole !== target.organizationRole) {
    if (actor.organizationRole !== 'SUPERADMIN') {
      throw new ForbiddenError('Only SUPERADMIN can change organization roles');
    }
    assertNotSelf(actor, target, 'change the role of');
    await assertNotLastActiveSuperadmin(target);
    updates.organizationRole = input.organizationRole;
  }

  if (Object.keys(updates).length === 0) return toPublicUser(target);

  const [updated] = await db.update(users).set(updates).where(eq(users.id, target.id)).returning();
  return toPublicUser(updated);
}

export async function setUserActive(actor: Actor, id: string, isActive: boolean) {
  const target = await findOrgUser(actor.organizationId, id);
  if (!target) throw new NotFoundError('User not found');
  assertCanManage(actor, target);

  if (!isActive) {
    assertNotSelf(actor, target, 'deactivate');
    await assertNotLastActiveSuperadmin(target);
  }

  if (target.isActive === isActive) return toPublicUser(target);

  const [updated] = await db.update(users).set({ isActive }).where(eq(users.id, target.id)).returning();
  return toPublicUser(updated);
}

export async function deleteUser(actor: Actor, id: string) {
  const target = await findOrgUser(actor.organizationId, id);
  if (!target) throw new NotFoundError('User not found');
  assertCanManage(actor, target);
  assertNotSelf(actor, target, 'delete');
  await assertNotLastActiveSuperadmin(target);

  await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, target.id));
}

export async function resendInvitation(actor: Actor, id: string) {
  const target = await findOrgUser(actor.organizationId, id);
  if (!target) throw new NotFoundError('User not found');
  assertCanManage(actor, target);
  if (target.passwordHash) throw new BadRequestError('This user has already set a password');

  await sendInvitationMail(target, actor.organizationId);
}
