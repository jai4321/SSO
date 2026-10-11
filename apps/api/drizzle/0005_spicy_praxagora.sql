ALTER TABLE "organizations" ADD COLUMN "contact_number" text;--> statement-breakpoint
UPDATE "organizations" SET "contact_number" = COALESCE("contact", '');--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "contact_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "organizations" SET "is_verified" = true;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "verification_token_hash" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "verification_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_name_unique" UNIQUE("name");
