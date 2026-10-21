# 1.3 Roles and Permissions (Organization Users)

Requirements: [summary.md](../summary.md) (Backend Task 4); roles are fixed: SUPERADMIN, ADMIN, MEMBER. Depends on 1.2.

## Backend
- [x] Add system-wide `permissions` and `role_permissions` tables and seed the fixed role grant matrix
- [x] Load current database grants for authenticated requests and include `user.permissions` in `GET /api/auth/me`
- [x] Add `requirePermission` and use permission grants for organization user routes
- [x] Keep ADMIN creator limits, MEMBER user-management denial, and role-assignment limits in backend policy checks
- [x] Keep SUPERADMIN access outside creator scope explicit and record override events in `audit_events`
- [x] Prevent removing or demoting the last active SUPERADMIN
- [x] Keep grants system-managed; Redis permission caching and runtime grant editing are outside this phase

## Frontend
- [x] Validate `/me` role and permission data and gate navigation and actions with shared `useCan`

## Tests
- [x] Verify migration grant matrix and permission guard behavior for SUPERADMIN, ADMIN, and MEMBER
- [x] Verify ADMIN creator limits, cross-organization denial, role assignment policy, and last-SUPERADMIN protection
- [x] Verify malformed/unknown frontend permission lists fail closed

Workspace membership and product-action checks are tracked with Phase 1.4 workspace routes.
