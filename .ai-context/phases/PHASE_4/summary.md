# Phase 4 - Product Authorization, Audit, and Lifecycle

## Goal
Complete product-scoped RBAC, auditability, replacement/deletion workflows, and operational improvements.

## Scope (from requirements)
- Product roles and permissions
- Product feature/menu management
- Audit logs and access review
- Workspace/product transfer and deletion workflows
- MFA/OTP confirmation for destructive actions
- Bulk operations, filtering, reports, and notifications

## Backend Tasks

### 1. Product Roles and Permissions
- `ProductRole` (id, product_id, name, description, created_at)
- `ProductPermission` (id, product_id, key, description, created_at)
- `ProductRolePermission` and `ProductUserRole` many-to-many tables scoped to one product.
- Product users can belong to multiple roles within the same product.
- Product managers can define roles and permissions only for products in workspaces they can manage.
- Product permissions may represent business actions such as `watch_video`, `upload_video`, or `manage_product_users`.
- Product feature/menu configuration is product-scoped and can expose only authorized actions.

### 2. Audit Logging and Access Review
- `AuditLog` (id, org_id, actor_type, actor_id, action_type, target_type, target_id, metadata, created_at).
- Record user creation, role changes, invitations, product changes, product-user changes, permission changes, transfers, deletions, and overrides.
- `GET /api/audit-logs` - SUPERADMIN only, paginated and filterable by actor, workspace, product, action, and date.
- Access review endpoints show current workspace members, products, product roles, permissions, and product users.

### 3. Transfer and Destructive Lifecycle Workflows
- Before an organization ADMIN is deactivated or deleted, each workspace they created or ADMIN-manage must retain another eligible ADMIN member or be transferred to another eligible organization user, unless SUPERADMIN performs an explicit override.
- Workspace transfer and user status change occur in one database transaction.
- Workspace deletion archives the workspace and its products and revokes associated product-user access; it does not hard-delete audit history.
- Product deletion archives the product and deactivates its product users.
- Destructive actions require explicit confirmation and may require OTP/MFA.

### 4. Bulk User Operations
- `POST /api/users/bulk` - bulk create users (CSV/JSON import), with validation report (success/failure per row).
- `PATCH /api/users/bulk/status` - bulk activate/deactivate.
- Process large batches via a background job queue (e.g. BullMQ on top of **Redis**) instead of blocking the request.

### 5. User Invitation Workflow
- `POST /api/users/invite` - generate invite token, store in Redis with TTL (`invite:<token>` -> user draft data), send invite email.
- `POST /api/invites/:token/accept` - new user sets password and activates account.
- Expired/invalid token handling.

### 6. Advanced Filtering & Search
- Add query params for filtering users/workspaces/products/roles (search by name/email, status, date range).
- Add DB indexes to support common filters (org_id, workspace_id, status).
- Consider full-text search (Postgres `tsvector` or a search service) if needed at larger scale.

### 7. Dashboard Reports
- Aggregate endpoints: active users count, workspaces count, permissions usage, recent activity summary.
- Cache expensive aggregate queries in Redis with short TTL (e.g. 60s) to avoid recomputation on every dashboard load.

### 8. Notifications
- Event-driven notifications (in-app + optional email) for:
  - user invited/activated
  - added to a workspace/product role
  - permission changes affecting the user
  - super admin override affecting the user's workspace
- Use a lightweight pub/sub via **Redis Pub/Sub** (or a queue) to decouple notification dispatch from the main request flow.
- `GET /api/notifications` - list current user's notifications (read/unread).

### 9. Audit Views Enhancement
- Export audit logs (CSV) for compliance.
- Retention policy configuration (archive old logs).

## Frontend Tasks

### 1. Bulk Operations UI
- CSV upload for bulk user creation with a preview/validation step.
- Bulk select + activate/deactivate actions in user table.

### 2. Invitation Flow UI
- "Invite user" form (email-based) instead of direct creation.
- Public invite-accept page (set password, confirm details).

### 3. Filters & Search UI
- Search bars and filter dropdowns on Users, Workspaces, Products, Roles, and Audit Log pages.

### 4. Dashboard
- Overview cards (users, workspaces, active sessions).
- Charts for activity trends (e.g. using a lightweight charting lib).

### 5. Notifications UI
- Notification bell/dropdown with unread count.
- Mark as read / mark all as read.

## Performance & Ops Tasks
- Load testing key endpoints (login, permission check, workspace listing).
- Review Redis memory usage/eviction policy for session, cache, and queue data.
- Horizontal scaling considerations for the Node.js API (stateless, sessions in Redis already support this from Phase 1).
- Review Docker Compose setup for a production-like multi-instance test (API behind a load balancer, shared Redis/Postgres).

## Deliverables
- Bulk import/activation tools for large organizations.
- Self-service invitation flow instead of admin-only manual creation.
- Searchable/filterable admin views across users, workspaces, and audit logs.
- Basic reporting dashboard.
- Notification system for access-related events.
