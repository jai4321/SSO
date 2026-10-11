# Phase 5 - Billing (Plans) & Platform Admin

## Goal
Add a plan/billing layer (without real payment processing) that gates how much each organization can create, and a platform-level admin panel where the system owner can see and manage all registered organizations.

## Key Decisions (agreed with product owner)
- The organization is the sold entity. One customer (e.g. Amazon) gets exactly one organization; we do not sell multiple organizations per customer.
- Plans limit four resources per organization: workspaces, organization users, products, and product users.
- Enforcement is hard: when an organization hits a plan limit, creation is blocked with an "upgrade plan" response.
- The admin panel is operated by a NEW actor: the platform admin. Platform admins are NOT organization users; they have a separate identity, separate login, and a separate table. Their access is cross-tenant by design and must be explicit and auditable.

## Scope

### 1. Plan Management
- `plans` table: name (e.g. FREE, PRO, ENTERPRISE), max_workspaces, max_organization_users, max_products, max_product_users, is_active, timestamps. Seed a default FREE plan.
- `organizations.plan_id` references the active plan; new registrations are assigned the default plan.
- Limits are organization-wide totals (e.g. max_products counts all products across the organization's workspaces).
- Only platform admins can create/edit plans and change an organization's plan. Organization users cannot self-upgrade (no payment flow in this phase).

### 2. Plan Limit Enforcement
- Enforced on the backend at creation time for: workspaces, organization users, products, product users.
- When a limit is reached, the API returns a structured error (e.g. 403 with code `PLAN_LIMIT_REACHED`, including the limit name and current/max values) so the frontend can show an "upgrade plan" message.
- Counts must respect existing tenant scoping and soft-delete rules (only active records count).
- Plan downgrades do NOT delete existing data; they only block new creation while over the limit.

### 3. Platform Admin Identity and Authentication
- Separate `platform_admins` table (email, password hash, status, timestamps) - completely independent from organization users.
- Separate login endpoint and token audience/scope so platform tokens can never be used against organization APIs and vice versa.
- No self-registration; platform admin accounts are seeded/provisioned manually.
- Same session/refresh-token standards as organization auth (Redis-backed sessions, rotation, revocation).

### 4. Platform Admin APIs (cross-tenant, audited)
- List organizations with stats: name, registration date, plan, status, organization user count, workspace count, product count, product user count.
- Organization detail view: full stats plus workspace/product breakdown.
- Change an organization's plan (with audit log entry).
- Activate/deactivate an organization (deactivation blocks all of its users' logins; audit logged).
- All platform admin actions are recorded in the audit log with actor, action, target organization, and timestamp.

### 5. Platform Admin Panel (frontend)
- Separate area in `apps/web` (e.g. `/platform` route group) with its own layout, guard, and login page - visually and logically separated from the organization dashboard.
- Pages: platform login, organizations list (table with stats + search/pagination), organization detail (stats, plan info, plan change action), plan management.
- Platform guard rejects organization sessions; organization guard rejects platform sessions.

## Out of Scope (this phase)
- Real payment gateway integration, card processing, invoicing, proration, trials with expiry jobs.
- Organization self-service upgrade/checkout flows.
- Usage metering over time / analytics dashboards.

## Deliverables
- Plan data model + migration, plan seeded, organization plan assignment.
- Backend limit enforcement at all four creation points with structured `PLAN_LIMIT_REACHED` errors.
- Platform admin auth (separate table, login, token scope).
- Platform admin APIs for organization listing/stats, plan change, org activation/deactivation, all audited.
- Platform admin panel frontend under its own guarded route group.
- Tests: limit enforcement per resource, cross-tenant isolation of platform tokens, audit entries for plan changes.
