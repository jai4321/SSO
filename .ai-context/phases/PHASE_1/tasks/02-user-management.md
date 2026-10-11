# 1.2 Organization User Creation and Management

Requirements: [summary.md](../summary.md) (Backend Task 3, Frontend Task 3). Depends on 1.1.

## Backend
- [x] `POST /api/users` - create organization user with allowed role (invitation/set-password email, no plain password sent)
- [x] `GET /api/users` - paginated list scoped to the organization, excluding soft-deleted
- [x] `GET /api/users/:id`
- [x] `PATCH /api/users/:id` - update details
- [x] `PATCH /api/users/:id/activate` and `/deactivate`
- [x] `DELETE /api/users/:id` - soft delete via `deleted_at`
- [x] Unique email per organization (globally unique partial index from 1.1 covers this; duplicate returns 409)
- [x] Add `created_by` to users (confirmed 2026-10-10: nullable self-FK, null for the first SUPERADMIN; migration 0010)
- [x] `POST /api/users/:id/resend-invitation` - new Redis set-password token (24h TTL, `USER_INVITE_TOKEN_TTL_SECONDS`) and resend invite mail; 400 if password already set

## Decisions (confirmed 2026-10-10)
- ADMIN may create ADMIN and MEMBER users (never SUPERADMIN); SUPERADMIN may assign any role; multiple SUPERADMINs per org allowed.
- Role changes via `PATCH /api/users/:id` are SUPERADMIN-only; ADMIN can edit names of users they created.
- Read scope: SUPERADMIN and ADMIN can list/view all organization users; MEMBER has no access (403).
- Lifecycle guards: cannot deactivate/delete/demote yourself; cannot deactivate/delete/demote the last active SUPERADMIN.
- Invitation flow: new user gets a `set-password:<sha256>` token in Redis and an email linking to `/set-password?token=...`; no plain password is ever sent.
- Route gating via `requireOrgRole('SUPERADMIN', 'ADMIN')` preHandler (src/guards); ownership rules enforced in `users.service.ts`.
- Smoke-tested end-to-end 2026-10-10 (28 checks: create/list/update/role policy/guards/deactivate-login-block/delete/invite+resend/MEMBER 403). Automated tests still pending below.

## Frontend
- [ ] Users list table (name, email, status, role)
- [ ] Create user form with roles allowed for the current role
- [ ] Activate/deactivate and delete actions
- [ ] `/set-password` page for invited users (reuses the set-password form from the verify flow)

## Tests
- [ ] Tenant isolation: cannot read or edit users of another organization
- [ ] Deactivated and soft-deleted users cannot log in
- [ ] Duplicate email handling
