CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"actor_user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"key" text PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "permissions_scope_check" CHECK ("permissions"."scope" in ('organization', 'workspace', 'product'))
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role" "organization_role" NOT NULL,
	"permission_key" text NOT NULL,
	CONSTRAINT "role_permissions_role_permission_key_pk" PRIMARY KEY("role","permission_key")
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_key_permissions_key_fk" FOREIGN KEY ("permission_key") REFERENCES "public"."permissions"("key") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "permissions" ("key", "scope", "description") VALUES
	('organization.users.read', 'organization', 'View users in the current organization'),
	('organization.users.create', 'organization', 'Create users in the current organization'),
	('organization.users.manage', 'organization', 'Manage users in the current organization'),
	('organization.users.assign_role', 'organization', 'Assign organization roles to users'),
	('workspace.create', 'workspace', 'Create workspaces in the current organization'),
	('workspace.products.manage', 'workspace', 'Manage products in accessible workspaces');
--> statement-breakpoint
INSERT INTO "role_permissions" ("role", "permission_key") VALUES
	('SUPERADMIN', 'organization.users.read'),
	('SUPERADMIN', 'organization.users.create'),
	('SUPERADMIN', 'organization.users.manage'),
	('SUPERADMIN', 'organization.users.assign_role'),
	('SUPERADMIN', 'workspace.create'),
	('SUPERADMIN', 'workspace.products.manage'),
	('ADMIN', 'organization.users.read'),
	('ADMIN', 'organization.users.create'),
	('ADMIN', 'organization.users.manage'),
	('ADMIN', 'workspace.create'),
	('ADMIN', 'workspace.products.manage'),
	('MEMBER', 'workspace.products.manage');
