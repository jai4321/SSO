import { sql } from 'drizzle-orm';
import { type AnyPgColumn, boolean, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './user';

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    createdBy: uuid('created_by').notNull().references((): AnyPgColumn => users.id),
    name: text('name').notNull(),
    addressLine1: text('address_line_1').notNull(),
    addressLine2: text('address_line_2'),
    country: text('country').notNull(),
    state: text('state').notNull(),
    city: text('city').notNull(),
    pincode: text('pincode').notNull(),
    contactNumber: text('contact_number').notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    verificationTokenHash: text('verification_token_hash'),
    verificationTokenExpiresAt: timestamp('verification_token_expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Names are unique per creator (case-insensitive), not globally: unrelated companies
    // may share a display name. Tenancy and references use the organization UUID.
    uniqueIndex('organizations_name_created_by_unique').on(sql`lower(${table.name})`, table.createdBy),
  ],
);