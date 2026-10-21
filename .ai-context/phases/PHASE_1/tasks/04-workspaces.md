# 1.4 Workspace Creation and Invitations

Requirements: [summary.md](../summary.md) (Backend Task 5, Frontend Task 4). Depends on 1.3.

## Database
- [ ] `workspaces`: align columns with spec (`created_by`, `deleted_at`; currently `owner_id`)
- [ ] `workspace_members` table
- [ ] Migration generated and applied

## Backend
- [ ] `POST /api/workspaces` - SUPERADMIN/ADMIN create; creator becomes workspace ADMIN member
- [ ] `GET /api/workspaces` - only visible workspaces (SUPERADMIN sees all)
- [ ] `GET /api/workspaces/:id`
- [ ] `POST /api/workspaces/:id/invitations` - invite existing org user as ADMIN or MEMBER
- [ ] `DELETE /api/workspaces/:id/members/:userId`
- [ ] Workspace delete (soft delete) by workspace ADMIN or SUPERADMIN
- [ ] `src/guards/requireWorkspaceMembership.ts`

## Frontend
- [ ] Workspace list and create form
- [ ] Workspace detail with member invitation and management

## Tests
- [ ] Register -> login -> create users by role -> create workspace -> invite ADMIN and MEMBER -> visibility checks
- [ ] Verify `workspace.products.manage` grants remain limited by organization tenancy and workspace membership
