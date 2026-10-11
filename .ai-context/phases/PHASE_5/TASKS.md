# Phase 5 Tasks - Billing (Plans) & Platform Admin

Requirements: [summary.md](./summary.md)

Workflow rule: backend first for each task, ask user for confirmation, then frontend.

- [ ] 1. Plan data model: `plans` table, seed default plan, `organizations.plan_id` migration
- [ ] 2. Plan limit enforcement (backend): block workspace, organization user, product, and product user creation with structured `PLAN_LIMIT_REACHED` error when over limit
- [ ] 3. Platform admin identity: `platform_admins` table, seeding, separate login + token scope (backend)
- [ ] 4. Platform admin APIs (backend): organizations list with stats, organization detail, plan change, org activate/deactivate, audit logging
- [ ] 5. Backend tests: limit enforcement, platform/org token isolation, audit entries
- [ ] 6. Platform admin panel (frontend): `/platform` route group with own guard, login page, organizations list with stats, organization detail + plan change, plan management
- [ ] 7. Frontend plan-limit handling: show "upgrade plan" message on `PLAN_LIMIT_REACHED` responses in organization app
- [ ] 8. Frontend tests for platform panel and limit messaging
