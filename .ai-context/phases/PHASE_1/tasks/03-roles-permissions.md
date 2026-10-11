# 1.3 Roles and Permissions (Organization Users)

Requirements: [summary.md](../summary.md) (Backend Task 4); roles are fixed: SUPERADMIN, ADMIN, MEMBER. Depends on 1.2.

## Backend
- [ ] Define permission policy per role (create users, manage users, create workspaces, manage products)
- [ ] `src/guards/requireOrgRole.ts`
- [ ] Role-assignment rules: which role may create which role
- [ ] ADMIN limited to users they created
- [ ] MEMBER cannot create or manage users
- [ ] SUPERADMIN override is explicit; audit hook for overrides
- [ ] Prevent removing or demoting the last SUPERADMIN
- [ ] Permission cache in Redis with invalidation on role change (optional)

## Frontend
- [ ] Navigation and actions shown by role (backend remains the security boundary)

## Tests
- [ ] Role matrix tests (SUPERADMIN, ADMIN, MEMBER) for each guarded endpoint
- [ ] Cross-organization access denied
