---
description: "Coding standards for the Fastify/Node backend: exception handling, config, middleware/guards layout, and service/module architecture."
applyTo: "apps/api/**"
---

# Node API Coding Standards

## 1. Global Exception Handling
- Never throw raw errors or send ad-hoc `reply.status(x).send(...)` from route handlers for expected failures. Use a typed `AppError`.
- Define `src/errors/app-error.ts`:
  - `AppError` base class with `statusCode: number`, `code: string` (machine-readable, e.g. `VALIDATION_ERROR`), `message`, and optional `details`.
  - Subclasses for common cases: `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `UnprocessableEntityError` (422), `InternalServerError` (500).
- Register one global handler in `buildApp()` (`src/app.ts`) via `app.setErrorHandler(...)` in `src/errors/error-handler.ts`:
  - If `error instanceof AppError`, respond with `{ statusCode, error: error.code, message, details }`.
  - If it's a Fastify/zod validation error, map to 400 with a normalized `{ statusCode: 400, error: 'VALIDATION_ERROR', message, details }` shape.
  - Otherwise, log the full error via `app.log.error` and respond with a generic 500 `{ statusCode: 500, error: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' }` — never leak stack traces or internals to the client.
  - Also register `app.setNotFoundHandler` for consistent 404 JSON responses on unmatched routes.
- Route handlers and services should `throw new NotFoundError('Workspace not found')` etc.; only the global handler decides HTTP status/response shape.

## 2. Centralized Environment Config
- All environment variables are read and validated in one place: `src/config/env.ts` (already established — extend this file, do not read `process.env` elsewhere).
- Every new environment variable must be added to the zod schema in `env.ts` with an explicit type/default, and mirrored in `.env.example`.
- Import `{ env }` from `@/config/env` anywhere a config value is needed; never import `dotenv` or touch `process.env` directly outside `env.ts`.

## 3. Centralized Middleware / Guards / Plugins Directory
- `src/middlewares/` — cross-cutting Fastify `onRequest`/`preHandler` hooks that apply broadly (request logging, request-id, tenant-context extraction).
- `src/guards/` — authorization guards that gate access based on role/membership/permission, e.g. `requireOrgRole.ts`, `requireWorkspaceMembership.ts`, `requireProductPermission.ts`. Guards are composable `preHandler` functions attached per-route/module, not global.
- `src/plugins/` — Fastify plugin wrappers for third-party integrations (e.g. swagger, multipart) when added; keep `app.register(...)` calls in `app.ts` thin by moving setup details into plugins when they grow beyond a couple of lines.
- Do not scatter auth/permission checks inline inside route handlers — always call a guard from `src/guards/`.

## 4. Service- and Module-Based Architecture
Organize backend features as self-contained modules under `src/modules/<module-name>/`, not by technical layer at the top level. Each module contains:
- `<module>.routes.ts` — Fastify route definitions only (path, schema, calls into service, guard attachment). No business logic.
- `<module>.service.ts` — business logic and orchestration. Services call the database (via `drizzle`) and Redis; this is where authorization rules from `AGENTS.md` are enforced.
- `<module>.schema.ts` — zod request/response schemas used for validation and typing.
- `<module>.types.ts` — module-local TypeScript types/interfaces (optional, only if not covered by schema inference).

Example target layout:
```
src/
  modules/
    auth/
    organizations/
    workspaces/
    products/
  middlewares/
  guards/
  plugins/
  errors/
  config/
  db/
  lib/
```
- Routes never call `db`/`redis` directly — only services do. This keeps modules testable and keeps tenant-scoping/authorization logic in one layer per module.
- Shared cross-module logic (e.g. audit logging) lives in `src/lib/`, not duplicated per module.
- Register each module's routes in `src/app.ts` via `app.register(<module>Routes, { prefix: '/api/<module>' })`.
