ALTER TABLE "organizations" ADD COLUMN "address_line_1" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "address_line_2" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "pincode" text;--> statement-breakpoint
UPDATE "organizations" SET "address_line_1" = COALESCE("address", ''), "country" = '', "state" = '', "city" = '', "pincode" = '';--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "address_line_1" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "state" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "pincode" SET NOT NULL;
