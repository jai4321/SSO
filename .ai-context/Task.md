# Task Tracker

Single place to see what is planned and what is done. Update the checkboxes as work completes (`[x]` done, `[~]` in progress, `[ ]` not started). Detailed checklists live in the linked files; requirements stay in `phases/PHASE_*/summary.md`.

## Phase 1 - Organization, Users, Workspaces

| Part | Scope | Status | File |
|------|-------|--------|------|
| 1.1 | Organization registration and verification, set password, login with server-managed HTTP-only session cookies | [~] In progress | [01-organization-registration.md](phases/PHASE_1/tasks/01-organization-registration.md) |
| 1.2 | Organization user creation and management with cookie-backed API requests | [~] In progress | [02-user-management.md](phases/PHASE_1/tasks/02-user-management.md) |
| 1.3 | Roles and permissions for SUPERADMIN, ADMIN, MEMBER | [x] Complete | [03-roles-permissions.md](phases/PHASE_1/tasks/03-roles-permissions.md) |
| 1.4 | Workspace creation and invitations | [ ] Not started | [04-workspaces.md](phases/PHASE_1/tasks/04-workspaces.md) |

Order: 1.1 -> 1.2 -> 1.3 -> 1.4. Each part includes its own backend, frontend and tests.

## Later phases

| Phase | Scope | Status | File |
|-------|-------|--------|------|
| 2 | Workspace authorization model | [ ] Not started | [TASKS.md](phases/PHASE_2/TASKS.md) |
| 3 | Product foundation | [ ] Not started | [TASKS.md](phases/PHASE_3/TASKS.md) |
| 4 | Product authorization, audit, lifecycle | [ ] Not started | [TASKS.md](phases/PHASE_4/TASKS.md) |
| 5 | Billing (plans) and platform admin | [ ] Not started | [TASKS.md](phases/PHASE_5/TASKS.md) |
| 6 | Deployment and DevOps | [ ] Not started | [TASKS.md](phases/PHASE_6/TASKS.md) |

## Rules
- Update the relevant task file in the same change that completes the work.
- If a task changes the data model or API, also update the phase `summary.md`.
