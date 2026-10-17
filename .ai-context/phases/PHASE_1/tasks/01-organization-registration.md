# 1.1 Organization Registration

Requirements: [summary.md](../summary.md) (Backend Tasks 1 and 2).

## Database
- [x] `organizations`: `created_by` (mandatory, deferrable FK to users); `name` unique per creator (changed 2026-10-09: was globally unique - unrelated companies may share a display name; enforced via `organizations_name_created_by_unique` on `(lower(name), created_by)`)
- [x] `organizations`: address_line_1, address_line_2, country, state, city, pincode
- [x] `organizations`: `contact_number`, `is_verified`, `verification_token_hash`, `verification_token_expires_at`
- [x] `users`: `deleted_at` (soft delete), nullable `password_hash`
- [x] Migrations 0002-0009 generated
- [x] Migrations applied and verified against a running PostgreSQL

## Backend
- [x] Global error handling (`AppError`, error handler, not-found handler)
- [x] SMTP env config, mailer (Nodemailer), Mailpit in docker-compose
- [x] `POST /api/organizations/register` - register organization + SUPERADMIN user in one transaction
- [x] Verification email template with Confirm button
- [x] `POST /api/organizations/verify` - verify token and set `is_verified`
- [x] Check user email is not already registered (decided: globally unique via partial unique index on `lower(email)` for non-deleted users)
- [x] `POST /api/organizations/resend-verification`
- [x] Re-registration with an email whose org was never verified refreshes the stale registration (overwrites details, rotates token, resends mail) instead of returning 409 (2026-10-09)
- [x] `POST /api/auth/set-password` - first SUPERADMIN sets password after verification (one-time token from `/verify`, hashed in Redis, 15 min TTL)
- [x] Password hashing (bcrypt)
- [x] `POST /api/auth/login` - block unverified organizations, deactivated and soft-deleted users
- [x] Redis sessions, `POST /api/auth/refresh`, `POST /api/auth/logout`
- [x] JWT auth middleware for protected routes
- [x] Rate limiting on registration, verify and login

## Frontend
- [x] Organization registration form (org details, address with country dropdown, user name and email)
- [x] `/verify-organization` page (calls verify API, shows set-password form)
- [x] Login page and cookie-backed session handling via Next.js route handlers; tokens stay in HTTP-only cookies, Zustand stores only the user profile, and middleware uses cookie presence for auth-page redirects

## Tests
- [ ] Registration creates org + user atomically; rolls back when email fails
- [ ] Verify: valid, expired, reused and invalid token
- [ ] Same org name allowed for different creators; rejected for the same creator
- [ ] Re-registering an unverified email updates details and resends verification; verified email still rejected
- [ ] Login blocked until organization verified
