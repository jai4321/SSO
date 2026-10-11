---
description: "Coding standards for the Next.js frontend: error boundaries/handling, env config, and centralized middleware/guards."
applyTo: "apps/web/**"
---

# Next.js Web Coding Standards

## 1. Global Exception Handling
Next.js has no single global handler like Express/Fastify — cover both render-time and request-time errors explicitly:
- **UI render errors**: add `src/app/error.tsx` (segment-level boundary) and `src/app/global-error.tsx` (root-level, catches errors `error.tsx` misses, must render its own `<html>/<body>`). Both receive `{ error, reset }` and must show a safe, generic message — never render `error.message`/stack from unexpected errors directly to users.
- **Route Handlers** (`app/api/**/route.ts`, used for BFF/proxy calls): wrap the handler body with a shared `withErrorHandler` helper from `src/lib/errors/with-error-handler.ts` that:
  - Catches thrown `AppError` (mirror the same `AppError`/subclass shape used in the API, in `src/lib/errors/app-error.ts`) and returns `NextResponse.json({ error, message }, { status })`.
  - Catches unknown errors, logs them server-side, and returns a generic `500 { error: 'INTERNAL_SERVER_ERROR' }` without leaking internals.
- **Server actions**: never let a server action throw an unhandled error to the client; catch and return a typed `{ success: false, error }` result, or throw `AppError` subclasses and translate them at the call site.
- **Client-side data fetching** (`@tanstack/react-query`, `axios` via `src/lib/api-client.ts`): centralize response/error normalization in an axios interceptor in `api-client.ts` so every caller gets a consistent `{ status, code, message }` error shape instead of parsing `error.response` ad hoc in components.

## 2. Centralized Environment Config
- Add `src/config/env.ts` (mirrors the API's `apps/api/src/config/env.ts` pattern) using zod, split into two schemas:
  - `serverEnv` — server-only variables (no `NEXT_PUBLIC_` prefix), validated once on the server and never imported into client components.
  - `clientEnv` — only `NEXT_PUBLIC_*` variables, safe to import anywhere.
- Never read `process.env.*` directly in components/routes — import `serverEnv`/`clientEnv` from `@/config/env`. Update `src/lib/api-client.ts` to source its base URL from `clientEnv` instead of inline `process.env.NEXT_PUBLIC_API_URL`.
- Every new variable must be added to the appropriate schema and mirrored in `.env.example`.

## 3. Centralized Middleware / Guards Directory
- `src/middleware.ts` (Next.js convention, root of `src/` or project root) stays thin: delegate to composable checks under `src/middlewares/`.
- `src/middlewares/` — request-level checks usable from `middleware.ts` (e.g. session/cookie presence, redirect-if-unauthenticated).
- `src/guards/` — page/component or server-action level authorization guards mirroring backend roles (e.g. `requireOrgRole`, `requireWorkspaceMembership`), used in server components/actions before rendering protected UI or calling protected server actions. Frontend guards are for UX only — the API remains the actual security boundary per `AGENTS.md`.
- Do not inline role/permission checks inside page components — call a guard from `src/guards/`.

## 4. Structure
The existing `app/`, `components/`, `lib/` layout is already appropriate for Next.js App Router and should be kept. Add the following alongside it (no restructuring needed):
```
src/
  app/
  components/
  lib/
    api-client.ts
    errors/
      app-error.ts
      with-error-handler.ts
  config/
    env.ts
  middlewares/
  guards/
```
