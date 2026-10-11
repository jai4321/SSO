# Phase 2 - Workspace Authorization Model

## Goal
Introduce workspace membership enforcement and workspace administration rules. Products and product-specific permissions are implemented in later phases.

## Scope (from requirements)
- Workspace membership and invitations
- Workspace ADMIN management
- Workspace access enforcement
- Restrictions for non-members

## Data Model (additions)
- `WorkspaceMember` (workspace_id, user_id, membership_role, invited_by, created_at)
- `WorkspaceInvitation` (id, workspace_id, user_id, invited_role, invited_by, status, created_at)

## Backend Tasks

### 1. Workspace Membership
- `POST /api/workspaces/:id/members` - workspace ADMIN adds an existing organization user as ADMIN or MEMBER.
- `DELETE /api/workspaces/:id/members/:userId` - remove user from the workspace.
- `GET /api/workspaces/:id/members` - list members.
- SUPERADMIN can manage any workspace membership.
- Workspace ADMIN members have equal management rights, including workspace deletion.
- MEMBER users can see and use only workspaces where they are members.

### 2. Workspace Management
- `PATCH /api/workspaces/:id` - update workspace details (SUPERADMIN or workspace ADMIN).
- `DELETE /api/workspaces/:id` - archive workspace (SUPERADMIN or workspace ADMIN), subject to the later confirmation and transfer workflow.
- Workspace ADMIN membership is the authorization boundary; there is no single workspace owner after invitations are supported.

### 3. Organization Role Enforcement
- Enforce the fixed organization roles `SUPERADMIN`, `ADMIN`, and `MEMBER`.
- Do not use workspace custom groups as a substitute for organization roles.
- A MEMBER cannot create or manage organization users or workspaces.
- Product-level custom roles and permissions are deferred to Phase 4.

### 4. Workspace Access Enforcement
- Require active workspace membership for all workspace routes.
- SUPERADMIN bypasses membership checks.
- ADMIN membership grants workspace administration rights.
- MEMBER membership grants access to products in that workspace but not workspace administration.

### 5. Access Enforcement Engine
- Core functions distinguish `hasOrganizationRole`, `isWorkspaceMember`, and `canManageWorkspace`.
- Access must be checked per organization and workspace, never globally.

### 6. Redis Considerations
- Cache workspace membership and organization-role lookups per organization/user.
- Invalidate membership caches immediately when a user is invited, removed, or their role changes.

## Frontend Tasks

### 1. Workspace Detail Page Enhancements
- Members tab: list/invite/remove workspace members.
- Show ADMIN and MEMBER membership roles.
- Hide workspaces from users who are not members, except SUPERADMIN.

### 2. Access-Aware UI
- Hide/disable actions the current user isn't permitted to perform (based on resolved permissions from API).
- Non-owner attempting restricted action sees a clear "access denied" state (AC4).

## Testing
- Unit tests: organization-role and workspace-membership authorization.
- Integration tests: Rohit and Kamal as equal workspace ADMIN members; Tanya as MEMBER restricted to products in the invited workspace.
- Cache invalidation tests: membership removal immediately revokes workspace access.

## Acceptance Criteria Covered
- AC4 (Workspace membership restriction)

## Deliverables
- Working workspace membership and ADMIN/MEMBER enforcement.
- End-to-end scenario validated: invited workspace ADMINs have equal rights and non-members are denied.
