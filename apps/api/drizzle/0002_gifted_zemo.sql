ALTER TABLE "organizations" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
UPDATE "organizations" o SET "created_by" = (
  SELECT u."id" FROM "users" u WHERE u."organization_id" = o."id"
  ORDER BY (u."organization_role" = 'SUPERADMIN') DESC, u."created_at" ASC LIMIT 1
);--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "created_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;
