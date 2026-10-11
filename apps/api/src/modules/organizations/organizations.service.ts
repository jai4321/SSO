import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { env } from '@/config/env';
import { organizations, users } from '@/db/schema';
import { BadRequestError, ConflictError } from '@/errors/app-error';
import { db } from '@/lib/db';
import { sendMail } from '@/lib/mailer';
import { isUniqueViolation } from '@/lib/pg-errors';
import { redis } from '@/lib/redis';
import { buildVerificationEmail } from './organizations.email';
import type { RegisterOrganizationInput, ResendVerificationInput } from './organizations.schema';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

const findUserWithOrganization = (email: string) =>
  db
    .select({
      id: users.id,
      organizationId: users.organizationId,
      isVerified: organizations.isVerified,
    })
    .from(users)
    .innerJoin(organizations, eq(users.organizationId, organizations.id))
    .where(and(sql`lower(${users.email}) = ${email.toLowerCase()}`, isNull(users.deletedAt)))
    .limit(1);

const issueVerificationToken = () => ({
  token: randomBytes(32).toString('hex'),
  expiresAt: new Date(Date.now() + env.ORG_VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000),
});

const sendVerificationMail = (to: string, organizationName: string, userName: string, token: string) =>
  sendMail({
    to,
    ...buildVerificationEmail({
      organizationName,
      userName,
      verifyUrl: `${env.WEB_APP_URL}/verify-organization?token=${token}`,
      expiresInHours: env.ORG_VERIFICATION_EXPIRES_HOURS,
    }),
  });

export async function registerOrganization(input: RegisterOrganizationInput) {
  const [existingUser] = await findUserWithOrganization(input.user.email);

  // The email belongs to a verified organization - genuinely taken.
  if (existingUser?.isVerified) throw new ConflictError('This email is already registered');

  // The email belongs to an organization that was never verified (e.g. the link expired):
  // overwrite the stale registration with the new details, rotate the token, and resend.
  if (existingUser) {
    await refreshStaleRegistration(existingUser, input);
    return;
  }

  // Names are only unique per creator, and the creator is always new here - no name pre-check.
  const { token, expiresAt } = issueVerificationToken();
  const userId = randomUUID();
  const organizationId = randomUUID();

  try {
    // The email is sent inside the transaction so a delivery failure rolls the registration back.
    await db.transaction(async (tx) => {
      // organizations.created_by is a deferred FK, so the org can be inserted before its first user.
      await tx.insert(organizations).values({
        id: organizationId,
        createdBy: userId,
        name: input.organizationName,
        contactNumber: input.contactNumber,
        addressLine1: input.address.addressLine1,
        addressLine2: input.address.addressLine2 || null,
        country: input.address.country,
        state: input.address.state,
        city: input.address.city,
        pincode: input.address.pincode,
        verificationTokenHash: hashToken(token),
        verificationTokenExpiresAt: expiresAt,
      });

      await tx.insert(users).values({
        id: userId,
        organizationId,
        name: input.user.name,
        email: input.user.email,
        organizationRole: 'SUPERADMIN',
      });

      await sendVerificationMail(input.user.email, input.organizationName, input.user.name, token);
    });
  } catch (err) {
    // Translate known Postgres unique violations into domain conflicts;
    // anything else propagates to the global error handler.
    if (isUniqueViolation(err, 'users_email_unique')) {
      throw new ConflictError('This email is already registered');
    }
    // Names are unique per creator only; fires when the same account reuses a name.
    if (isUniqueViolation(err, 'organizations_name_created_by_unique')) {
      throw new ConflictError('An organization with this name already exists for this account');
    }
    throw err;
  }
}

// A previous registration was never verified: overwrite org/user details with the new input,
// rotate the verification token (old links stop working), and send a fresh email.
async function refreshStaleRegistration(
  existingUser: { id: string; organizationId: string },
  input: RegisterOrganizationInput,
) {
  const { token, expiresAt } = issueVerificationToken();

  // The email is sent inside the transaction so a delivery failure rolls the update back.
  await db.transaction(async (tx) => {
    await tx
      .update(organizations)
      .set({
        name: input.organizationName,
        contactNumber: input.contactNumber,
        addressLine1: input.address.addressLine1,
        addressLine2: input.address.addressLine2 || null,
        country: input.address.country,
        state: input.address.state,
        city: input.address.city,
        pincode: input.address.pincode,
        verificationTokenHash: hashToken(token),
        verificationTokenExpiresAt: expiresAt,
      })
      .where(eq(organizations.id, existingUser.organizationId));

    await tx.update(users).set({ name: input.user.name }).where(eq(users.id, existingUser.id));

    await sendVerificationMail(input.user.email, input.organizationName, input.user.name, token);
  });
}

export async function verifyOrganization(token: string) {
  const [verified] = await db
    .update(organizations)
    .set({ isVerified: true, verificationTokenHash: null, verificationTokenExpiresAt: null })
    .where(
      and(
        eq(organizations.verificationTokenHash, hashToken(token)),
        eq(organizations.isVerified, false),
        gt(organizations.verificationTokenExpiresAt, new Date()),
      ),
    )
    .returning({ id: organizations.id });

  if (!verified) throw new BadRequestError('Verification link is invalid or has expired');

  const [superAdmin] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.organizationId, verified.id),
        eq(users.organizationRole, 'SUPERADMIN'),
        isNull(users.passwordHash),
        isNull(users.deletedAt),
      ),
    )
    .limit(1);

  if (!superAdmin) throw new BadRequestError('Verification link is invalid or has expired');

  // One-time credential that lets the first SUPERADMIN set a password; stored hashed, short-lived.
  const setPasswordToken = randomBytes(32).toString('hex');
  await redis.set(
    `set-password:${hashToken(setPasswordToken)}`,
    superAdmin.id,
    'EX',
    env.SET_PASSWORD_TOKEN_TTL_SECONDS,
  );

  return { setPasswordToken };
}

export async function resendVerification(input: ResendVerificationInput) {
  const [row] = await db
    .select({
      userId: users.id,
      userName: users.name,
      organizationId: organizations.id,
      organizationName: organizations.name,
      isVerified: organizations.isVerified,
    })
    .from(users)
    .innerJoin(organizations, eq(users.organizationId, organizations.id))
    .where(and(sql`lower(${users.email}) = ${input.email.toLowerCase()}`, isNull(users.deletedAt)))
    .limit(1);

  // Return silently when the email is unknown or already verified to avoid account enumeration.
  if (!row || row.isVerified) return;

  const { token, expiresAt } = issueVerificationToken();
  await db
    .update(organizations)
    .set({ verificationTokenHash: hashToken(token), verificationTokenExpiresAt: expiresAt })
    .where(eq(organizations.id, row.organizationId));

  await sendVerificationMail(input.email, row.organizationName, row.userName, token);
}
