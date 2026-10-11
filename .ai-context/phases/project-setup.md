# Phase 0 - Project Setup & Architecture

## Goal
Establish the technical foundation of the project before building any feature. This phase sets up the monorepo structure, tooling, and infrastructure so all later phases can move fast.

## Tech Stack
- **Frontend**: Next.js (TypeScript)
- **Backend**: Node.js (TypeScript) - REST/GraphQL API server (Express/Fastify/Nest, to be decided)
- **Database**: PostgreSQL (or chosen RDBMS) with an ORM (Prisma/TypeORM)
- **Cache / Session store**: Redis
- **Containerization**: Docker + Docker Compose
- **Package management**: npm/pnpm workspaces (monorepo) or separate repos (to be decided)

## Tasks

### 1. Repository Structure
- Decide monorepo vs multi-repo (frontend, backend, shared types).
- Set up folder structure:
  - `apps/web` (Next.js frontend)
  - `apps/api` (Node.js backend)
  - `packages/shared` (shared TypeScript types/DTOs, e.g. permission/role enums)
- Configure workspace tooling (pnpm/npm workspaces or turborepo).

### 2. TypeScript Configuration
- Base `tsconfig.json` shared across frontend/backend.
- Strict mode enabled (`strict: true`, `noImplicitAny`, etc.).
- Path aliases for shared packages.

### 3. Linting & Formatting
- ESLint + Prettier configuration shared across apps.
- Husky + lint-staged for pre-commit checks.
- Commit message convention (optional: commitlint).

### 4. Backend Bootstrap
- Initialize Node.js + TypeScript backend project.
- Choose and configure framework (Express/Fastify/NestJS).
- Configure environment variable handling (`dotenv`, config validation with `zod`/`joi`).
- Set up base folder structure: `controllers`, `services`, `repositories`, `middlewares`, `routes`, `types`.

### 5. Frontend Bootstrap
- Initialize Next.js app with TypeScript.
- Configure routing structure (App Router).
- Set up API client layer (typed fetch/axios wrapper).
- Configure state management approach (React Query/Zustand/Context) for auth/session state.

### 6. Database Setup
- Choose ORM (Prisma recommended for TypeScript).
- Define initial connection config.
- Set up migration tooling.

### 7. Redis Setup
- Add Redis client (`ioredis`) to backend.
- Define initial use cases:
  - Session/token storage
  - Caching permission lookups
  - Rate limiting
- Local Redis container for development.

### 8. Docker & Docker Compose
- `Dockerfile` for backend (multi-stage build: build TS -> run compiled JS).
- `Dockerfile` for frontend (Next.js production build).
- `docker-compose.yml` with services:
  - `web` (Next.js)
  - `api` (Node.js)
  - `postgres`
  - `redis`
- `.env` / `.env.example` files per service.
- Volume mounts for local dev hot-reload (optional dev-compose file).

### 9. CI Pipeline (basic)
- Lint + type-check + build on push/PR.
- Run unit tests (once available).

### 10. Documentation
- `README.md` with setup instructions (local dev, Docker, env vars).
- Architecture diagram (high-level: frontend, backend, DB, Redis).

## Deliverables
- Working monorepo skeleton with frontend and backend booting locally.
- `docker-compose up` starts web, api, postgres, redis successfully.
- Base TypeScript types shared between frontend/backend.
- CI pipeline running lint/build on every push.
