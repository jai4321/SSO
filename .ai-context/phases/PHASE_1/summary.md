# Phase 1 - Foundation

## Goal
Implement organization registration, authentication, organization roles, user management, workspace creation, and workspace invitations.

## Scope (from requirements)
- Organization registration
- Admin account setup
- Login and authentication
- User management (create/activate/deactivate)
- Workspace creation and membership invitations

## Data Model (initial)
- `Organization` (id, created_by, name, address_line_1, address_line_2, country, state, city, pincode, contact_number, is_verified, verification_token_hash, verification_token_expires_at, created_at); `name` is unique per creator (case-insensitive `(lower(name), created_by)` index), not globally - unrelated organizations may share a display name; identity is the UUID
- `User` (id, org_id, name, email, password_hash [nullable until set after verification], organization_role, is_active, created_by [nullable self-FK; null for the first SUPERADMIN from registration], created_at, deleted_at)
- `Workspace` (id, org_id, created_by, name, created_at, deleted_at)
- `WorkspaceMember` (workspace_id, user_id, membership_role, invited_by, created_at)

Organization roles are fixed in Phase 1:
- `SUPERADMIN`: full organization, user, workspace, product, and product-user control.
- `ADMIN`: can create organization users permitted by the role policy, create workspaces, and manage workspaces where they are the creator or an invited workspace ADMIN.
- `MEMBER`: cannot create organization users; can manage products only in workspaces where they are invited.

`Organization.created_by` is mandatory (NOT NULL) and references the user who created the organization; the FK is deferrable because the organization and its first user are inserted in one transaction. Users are never hard-deleted: deletion sets `User.deleted_at` (soft delete), so `created_by` references stay valid. Queries must exclude users with `deleted_at` set, and soft-deleted users cannot log in.

The initial super admin is created during organization registration. A user may hold one organization role and may be an ADMIN member of multiple workspaces.

## Backend Tasks

### 1. Organization Registration API
- `POST /api/organizations/register` - register org + first SUPERADMIN user (person of control) in one transaction. Input: organization name, contact number, address details, and the user's name and email. No password is collected at registration.
  - The organization is created with `is_verified = false` and a verification token (random 32 bytes; only its SHA-256 hash is stored in `verification_token_hash`) with `verification_token_expires_at` (24 hours, configurable via `ORG_VERIFICATION_EXPIRES_HOURS`).
  - A verification email with a "Confirm organization" button is sent to the user's email (Nodemailer over SMTP; Mailpit locally). The button opens the web page `/verify-organization?token=...`. If the email cannot be sent, the registration is rolled back.
- `POST /api/organizations/verify` - body `{ token }`; sets `is_verified = true` and clears the token and expiry. Fails with 400 if the token is invalid, already used, or expired. The web page then shows a set-password form for the first SUPERADMIN (set-password API to be defined next).
- Validate uniqueness of org name/email (input validation with `zod`): the email is globally unique (409 when it belongs to a verified organization); re-registering an email whose organization was never verified overwrites the stale registration, rotates the verification token, and resends the email - so an expired link never locks a registration out. Org names are unique per creator, not globally.
- Store organization details (name, address, contact info).
- Address fields: `address_line_1` (text, required), `address_line_2` (text, optional), `country` (dropdown, required; stored as ISO 3166-1 alpha-2 code), `state` (text, required), `city` (text, required), `pincode` (numeric digits only, required; stored as text to preserve leading zeros).

### 2. Authentication
- Password hashing with `bcrypt`/`argon2`.
- Login endpoint `POST /api/auth/login` - validate credentials, issue JWT (access + refresh token).
- Store refresh tokens / active sessions in **Redis** (key: `session:<userId>:<tokenId>`), enabling revocation and multi-device logout.
- Middleware to verify JWT on protected routes.
- `POST /api/auth/logout` - invalidate session in Redis.
- `POST /api/auth/refresh` - rotate access token using refresh token.

### 3. User Management
- `POST /api/users` - SUPERADMIN or permitted ADMIN creates organization users with an allowed organization role.
- `GET /api/users` - list users in organization (paginated).
- `PATCH /api/users/:id` - update user details.
- `PATCH /api/users/:id/activate` and `/deactivate` - toggle user status.
- Enforce unique login credentials (email) per organization.
- Middleware: block deactivated users from authenticating.
- SUPERADMIN can manage any organization user.
- ADMIN can manage users they created within the allowed role policy.
- MEMBER cannot create or manage organization users.
- Role policy (decided 2026-10-10): SUPERADMIN may assign any role (multiple SUPERADMINs per org allowed); ADMIN may create ADMIN/MEMBER only and manages only users they created (`users.created_by`); MEMBER has no user-management access (403). Role changes are SUPERADMIN-only. Guards: cannot deactivate/delete/demote yourself or the last active SUPERADMIN.
- Invitation flow (decided 2026-10-10): created users receive a set-password email (Redis `set-password:<sha256>` token, 24h TTL via `USER_INVITE_TOKEN_TTL_SECONDS`) linking to `/set-password?token=...`; `POST /api/users/:id/resend-invitation` issues a fresh token. No plain password is ever sent.

### 4. Organization Authorization
- Replace the binary `is_super_admin` guard with the fixed organization role policy.
- SUPERADMIN bypasses organization, workspace, product, and product-user ownership restrictions.
- ADMIN actions are limited to users they created and workspaces they created or where they are an invited ADMIN.
- MEMBER actions are limited to products and product users in invited workspaces.
- Authorization must be enforced on the backend and checked against the organization ID.

### 5. Workspace Creation and Invitations
- `POST /api/workspaces` - SUPERADMIN and ADMIN create a workspace; creator becomes an ADMIN member.
- `GET /api/workspaces` - list only workspaces visible to the current user; SUPERADMIN sees all.
- `GET /api/workspaces/:id` - accessible to SUPERADMIN and workspace members.
- `POST /api/workspaces/:id/invitations` - SUPERADMIN or a workspace ADMIN invites an existing organization user as ADMIN or MEMBER.
- `DELETE /api/workspaces/:id/members/:userId` - SUPERADMIN or workspace ADMIN removes a member.
- Invited ADMIN members have the same workspace management rights as the creating ADMIN and may delete the workspace.
- MEMBER users cannot create workspaces and cannot access workspaces where they are not members.
- Enforce: workspace belongs to exactly one organization.

## Frontend Tasks (Next.js + TypeScript)

### 1. Auth Pages
- Organization registration page/form (org details + first admin account).
- Login page.
- Session handling via HTTP-only cookies (store JWT securely) or Next.js middleware for route protection.

### 2. Dashboard Shell
- Authenticated layout with navigation (Organization, Users, Workspaces).
- Show only organization users, workspaces, and workspace actions allowed by the current organization role and membership.

### 3. User Management UI
- List users table (name, email, status, role).
- Create user form with role choices allowed by the current organization role.
- Activate/deactivate toggle action.

### 4. Workspace UI
- List of workspaces (owned + accessible).
- Create workspace form/modal.
- Workspace detail page with member invitation and management controls.

## Redis Usage in this Phase
- Session/token store for login state and logout invalidation.
- Optional: cache user profile lookups (`user:<id>`) to reduce DB hits on every authenticated request.

## Testing
- Unit tests: password hashing, JWT issuance/verification, org/user/workspace services.
- Integration tests: register org -> login -> create users by role -> create workspace -> invite ADMIN and MEMBER -> enforce workspace visibility and actions.

## Acceptance Criteria Covered
- AC1 (Super Admin Access - login works, full visibility)
- AC2 (Organization role restrictions)
- AC3 (Workspace creation and membership)

## Deliverables
- Organization can register and log in.
- SUPERADMIN can manage all users and resources.
- ADMIN can create/manage permitted users and manage created or invited workspaces.
- MEMBER can manage products only in invited workspaces once products are available.
- Redis-backed session management working end-to-end via Docker Compose.
