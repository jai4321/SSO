# Phase 6 - Deployment & DevOps

## Goal
Take the system from local Docker Compose development to a deployable, production-ready setup.

## Tasks

### 1. Production Docker Images
- Multi-stage `Dockerfile` for backend: install deps -> compile TypeScript -> copy only `dist` + `node_modules` (prod) into a slim runtime image (e.g. `node:20-alpine`).
- Multi-stage `Dockerfile` for Next.js frontend: build with `next build` -> run with `next start` (or standalone output mode) in a slim image.
- Ensure containers run as non-root user.

### 2. Docker Compose for Production-like Environment
- Separate `docker-compose.prod.yml` (no bind mounts, uses built images, restart policies).
- Environment-specific `.env` files (never commit secrets; use `.env.example` as template).
- Health checks for `api`, `web`, `postgres`, `redis` services.

### 3. Redis Hardening
- Enable password auth (`requirepass`) in non-dev environments.
- Configure persistence (AOF/RDB) if Redis is used for anything beyond ephemeral cache (e.g. sessions that must survive restarts).
- Set eviction policy appropriate for cache vs session use (e.g. `allkeys-lru` for cache-only instance; consider separate Redis instances/databases for sessions vs cache vs queues).

### 4. Database Migrations in Deployment
- Run migrations as a separate step/job before starting the API container (avoid race conditions with multiple API replicas migrating simultaneously).
- Backup strategy for Postgres.

### 5. Secrets Management
- Move secrets (DB password, JWT signing key, Redis password) out of `.env` files in production; use a secrets manager or platform-provided secret storage.

### 6. CI/CD Pipeline
- On PR: lint, type-check, unit tests, build Docker images.
- On merge to main: build + push Docker images to a registry, run integration tests against a docker-compose stack, deploy to staging.
- Manual/approval gate for production deploy.

### 7. Observability
- Structured logging (JSON logs) from Node.js backend.
- Centralized log aggregation (e.g. ELK/Loki) - future consideration.
- Basic health/readiness endpoints (`/healthz`, `/readyz`) checking DB and Redis connectivity.
- Metrics endpoint (Prometheus format) for request rates, latency, error rates - future consideration.

### 8. Security Hardening
- HTTPS termination (reverse proxy/load balancer, e.g. Nginx/Traefik in front of `web`/`api`).
- Rate limiting on auth endpoints backed by Redis (protect against brute force login attempts).
- CORS configuration restricted to known frontend origins.
- Security headers (helmet.js for Express/Fastify, Next.js security headers config).

## Deliverables
- Production-grade Docker images for frontend and backend.
- Documented deployment process (compose or orchestrator of choice).
- CI/CD pipeline building, testing, and deploying automatically.
- Hardened Redis and Postgres configuration for production use.
