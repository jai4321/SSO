import { createHash } from 'node:crypto';
import bcrypt from 'bcrypt';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { env } from '@/config/env';
import { organizations, users } from '@/db/schema';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@/errors/app-error';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import type { OrganizationRole } from '@/types/fastify-jwt';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
const sessionKey = (userId: string, tokenId: string) => `session:${userId}:${tokenId}`;

export interface AuthUser {
  id: string;
  organizationId: string;
  organizationRole: OrganizationRole;
}

export async function validateCredentials(email: string, password: string): Promise<AuthUser> {
  const [row] = await db
    .select({
      id: users.id,
      organizationId: users.organizationId,
      organizationRole: users.organizationRole,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
      organizationIsVerified: organizations.isVerified,
    })
    .from(users)
    .innerJoin(organizations, eq(users.organizationId, organizations.id))
    .where(and(sql`lower(${users.email}) = ${email.toLowerCase()}`, isNull(users.deletedAt)))
    .limit(1);

  if (!row || !row.passwordHash) throw new UnauthorizedError('Invalid email or password');

  const matches = await bcrypt.compare(password, row.passwordHash);
  if (!matches) throw new UnauthorizedError('Invalid email or password');

  if (!row.isActive) throw new ForbiddenError('Your account has been deactivated');
  if (!row.organizationIsVerified) {
    throw new ForbiddenError('Organization is not verified yet. Check your verification email.');
  }

  return { id: row.id, organizationId: row.organizationId, organizationRole: row.organizationRole };
}

export async function getAuthUserById(id: string): Promise<AuthUser> {
  const [row] = await db
    .select({
      id: users.id,
      organizationId: users.organizationId,
      organizationRole: users.organizationRole,
      isActive: users.isActive,
      organizationIsVerified: organizations.isVerified,
    })
    .from(users)
    .innerJoin(organizations, eq(users.organizationId, organizations.id))
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);

  if (!row || !row.isActive) throw new UnauthorizedError('Account is deactivated or no longer exists');
  if (!row.organizationIsVerified) throw new ForbiddenError('Organization is not verified yet');

  return { id: row.id, organizationId: row.organizationId, organizationRole: row.organizationRole };
}

export async function storeSession(userId: string, tokenId: string, refreshToken: string) {
  await redis.set(
    sessionKey(userId, tokenId),
    hashToken(refreshToken),
    'EX',
    env.REFRESH_TOKEN_TTL_SECONDS,
  );
}

// Single-use rotation: GETDEL validates and revokes the old session atomically.
export async function rotateSession(userId: string, tokenId: string, presentedRefreshToken: string) {
  const stored = await redis.getdel(sessionKey(userId, tokenId));
  if (!stored || stored !== hashToken(presentedRefreshToken)) {
    throw new UnauthorizedError('Refresh token is invalid or has been revoked');
  }
}

export async function removeSession(userId: string, tokenId: string) {
  await redis.del(sessionKey(userId, tokenId));
}

export async function setPassword(token: string, password: string) {
  const userId = await redis.getdel(`set-password:${hashToken(token)}`);
  if (!userId) throw new BadRequestError('Set-password link is invalid or has expired');

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const [updated] = await db
    .update(users)
    .set({ passwordHash })
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .returning({ id: users.id });

  if (!updated) throw new BadRequestError('Set-password link is invalid or has expired');
}
