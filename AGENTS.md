# OneSysUser Project Instructions

## Project Summary
OneSysUser is a multi-tenant organization access management system. The hierarchy is Organization -> Workspace -> Product. Organizations contain organization users with the built-in roles SUPERADMIN, ADMIN, and MEMBER. Workspaces contain products and workspace memberships. Products have separate product users and product-scoped custom roles and permissions.

## Technology Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Node.js, TypeScript, Fastify
- Database: PostgreSQL accessed through Drizzle ORM
- Cache and sessions: Redis
- Local infrastructure: Docker and Docker Compose
- Workspace layout: `apps/web` for frontend and `apps/api` for backend

## Requirement Context
Before implementing or changing product behavior, read the relevant requirements in `.ai-context`:
- `.ai-context/final_requirement.md` is the consolidated product requirement and phased plan.
- `.ai-context/Requirement_user_management.md` contains the original user-management requirements and business context.
- `.ai-context/phases/` contains the implementation plan for each project phase.

When an AI agent reads this file, it must consult the relevant requirement files above before making feature, data-model, authorization, API, or UI decisions. Treat the requirement documents as the source of truth for product behavior, then preserve the existing codebase conventions.

## Working Process
- When given a requirement or task, analyse it first before changing anything.
- If anything is unclear or has multiple reasonable approaches (data model, nullability, behavior, scope), ask the user questions first and wait for answers before implementing.
- Track progress in [.ai-context/Task.md](.ai-context/Task.md) and the linked task files; tick off tasks in the same change that completes them.
- Task workflow: always complete the backend work for a task first, then ask the user for confirmation before starting the frontend work. Only begin the frontend after the user confirms.

## Architecture Rules
- Keep organization, workspace, group, permission, and audit data tenant-scoped.
- Enforce authorization on the backend; frontend visibility is not a security boundary.
- Evaluate organization permissions, workspace membership, and product permissions at their own scope; never treat them as global permissions.
- Super-admin overrides must be explicit and auditable.
- SUPERADMIN has full organization, user, workspace, product, and product-user control.
- ADMIN can manage workspaces they created and workspaces where they are explicitly invited as an ADMIN; workspace ADMIN members have equal management rights.
- MEMBER can manage products and product users only in workspaces where they are explicitly invited.
- Products have no individual owner. Workspace members with access to the workspace can manage its products according to the applicable organization and product permissions.
- Product users are separate from organization users. External product systems use the API to register, authenticate, manage product users, and evaluate product roles and permissions.
- Use Drizzle migrations for PostgreSQL schema changes.
- Use Redis for sessions, revocation, permission caching, rate limiting, and future background jobs where appropriate.
- Validate environment variables and external input with schemas.
- Keep secrets out of source control; update `.env.example` when environment variables change.

## Development Rules
- Use TypeScript strict mode and preserve existing public APIs unless the requirement requires a change.
- Prefer small, focused modules and existing project patterns.
- Add tests for authentication, tenant isolation, authorization, cache invalidation, and audit behavior.
- Run the narrowest relevant typecheck, lint, test, or build after changes.
- Do not modify unrelated user changes.

## Commands
- `npm run dev:api` starts the Fastify backend.
- `npm run dev:web` starts the Next.js frontend.
- `npm run db:generate --workspace=apps/api` generates Drizzle migrations.
- `npm run db:migrate --workspace=apps/api` applies Drizzle migrations.
- `docker compose up -d` starts PostgreSQL and Redis.

## Scope-Specific Instructions
- Backend changes: follow the API conventions in `apps/api` and use Drizzle for database access.
- Frontend changes: also read `apps/web/AGENTS.md` and follow its Next.js-specific guidance.
- Requirement or phase changes: update the appropriate files under `.ai-context` rather than creating duplicate requirement documents at the repository root.
