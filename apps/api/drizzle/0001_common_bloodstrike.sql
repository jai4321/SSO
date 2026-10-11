CREATE TYPE "public"."organization_role" AS ENUM('SUPERADMIN', 'ADMIN', 'MEMBER');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "organization_role" "organization_role" DEFAULT 'MEMBER' NOT NULL;--> statement-breakpoint
UPDATE "users"
SET "organization_role" = CASE
	WHEN "is_super_admin" THEN 'SUPERADMIN'::"public"."organization_role"
	ELSE 'MEMBER'::"public"."organization_role"
END;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_super_admin";