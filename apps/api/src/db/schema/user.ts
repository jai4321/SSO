import { sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  pgEnum,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization";

export const organizationRoleEnum = pgEnum("organization_role", [
  "SUPERADMIN",
  "ADMIN",
  "MEMBER",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    organizationRole: organizationRoleEnum("organization_role")
      .default("MEMBER")
      .notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    // Who created this user (null for the first SUPERADMIN from organization registration).
    // Drives the "ADMIN manages users they created" rule.
    createdBy: uuid("created_by").references((): AnyPgColumn => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    // Emails are globally unique among non-deleted users so login only needs email + password.
    uniqueIndex("users_email_unique")
      .on(sql`lower(${table.email})`)
      .where(sql`${table.deletedAt} is null`),
  ],
);
