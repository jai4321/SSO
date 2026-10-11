# Phase 3 - Product Foundation

## Goal
Introduce products as the final organization resource layer and support separate product users managed by external product systems.

## Scope (from requirements)
- Product creation and management
- Product visibility within a workspace
- Separate product-user accounts
- Product client credential (client_id/client_secret) issuance and rotation
- OAuth2/OIDC-style product login SDK/API and scoped integration endpoints

## Data Model (additions)
- `Product` (id, workspace_id, name, key, created_at, deleted_at)
- `ProductUser` (id, product_id, external_subject, email, profile, is_active, created_at)
- `ProductApiClient` (id, product_id, client_id, client_secret_hash, status, rotated_at, created_at)
- `ProductUserToken` / session store (Redis) keyed by product_id + token_id, tracking the client_secret version it was issued under so rotation can invalidate old tokens.

## Backend Tasks

### 1. Product Management
- `POST /api/workspaces/:id/products` - create a product for an accessible workspace.
- `GET /api/workspaces/:id/products` - list products visible to workspace members.
- `PATCH /api/products/:id` - update product details (SUPERADMIN or any active workspace member).
- `DELETE /api/products/:id` - archive a product (SUPERADMIN or any active workspace member, subject to the later confirmation workflow).
- Any active workspace member can see products in that workspace.
- Product creation does not create a product owner. Products are shared workspace resources.
- SUPERADMIN can manage products in any organization workspace.
- Workspace ADMIN can manage products in workspaces where they are an ADMIN member.
- Workspace MEMBER can create and manage products and product users only in workspaces where they are an active member.

### 2. Product User Integration
- Product users are separate from organization users and cannot access organization administration or workspace management.
- Each product has exactly one active `ProductApiClient` (client_id/client_secret pair), created automatically when the product is created.
- `POST /api/products/:id/client-credentials/rotate` - regenerate the client_secret; usable by SUPERADMIN or any workspace member authorized to manage the product. Rotation immediately invalidates tokens issued under the previous secret (checked via secret version stamped on each token/session).
- `PATCH /api/products/:id/integration` - enable/disable the product's integration.
- `POST /api/products/:id/oauth/login` (or SDK-driven equivalent) - authenticated with the product's client_id/client_secret, this endpoint performs the actual end-user login (OAuth2/OIDC-style): OneSysUser authenticates the product user (credentials, MFA, etc.) and issues an access token + refresh token scoped to that product and product user. The product itself never sees or stores the user's OneSysUser credentials.
- `POST /api/products/:id/users` - product integration creates or provisions a product user (used for pre-registration or sync scenarios).
- `GET /api/products/:id/users/me` (bearer product-user token) - fetch the authenticated product user's profile.
- `GET /api/products/:id/users/me/permissions` (bearer product-user token) - fetch the authenticated product user's roles and permissions.
- `POST /api/products/:id/oauth/token/refresh` - exchange a valid refresh token for a new access token.
- `POST /api/products/:id/oauth/token/verify` - server-to-server token introspection for the product backend.
- `PATCH /api/products/:id/users/:userId` - product integration updates product-user profile/status.
- `DELETE /api/products/:id/users/:userId` - deactivate or remove a product user from the product.
- Product authentication is isolated from organization-user authentication; product users cannot use organization login endpoints and vice versa.
- Product integrations must be scoped to one product and must not access another product's client credentials, users, roles, or permissions.
- All client_secret rotation, enable/disable, and revocation events are written to the audit log.

### 3. Product Administration Surface
- Product APIs expose product users, roles, permissions, and feature/menu configuration boundaries for implementation in Phase 4.
- All product-management operations are available to authorized organization users through the product's management interface or API.

### 4. Redis Considerations
- Cache product-user sessions and product integration credentials carefully, with product scope in every key.
- Stamp each session/token with the client_secret version active at issuance; on rotation, reject or actively purge sessions tied to the prior version.
- Invalidate product-user access immediately when a product user is deactivated or removed.

## Frontend Tasks

### 1. Product Management UI
- Workspace product list and create-product form for authorized members.
- Product management area for product users and, in Phase 4, custom roles and permissions.

### 2. Product User UI
- Product user list, activation/deactivation, and product authentication configuration.

### 3. Integration UI
- Product API client configuration and scoped credential management.

## Testing
- Unit tests: product access is limited to active workspace members and SUPERADMIN override.
- Integration tests: create workspace -> invite members -> create products -> manage separate product users through a product-scoped API client.
- Integration tests: product OAuth2/OIDC login issues tokens scoped to the correct product; token verify/refresh work; rotating a product's client_secret invalidates previously issued tokens.
- Tenant-isolation tests: a product integration cannot read or mutate another product's users, roles, permissions, or client credentials.

## Acceptance Criteria Covered
- Product management and separate product-user integration.
- AC8 (client credential scoping) and AC9 (secret rotation invalidates old tokens).

## Deliverables
- Products exist beneath workspaces and are visible to all active workspace members.
- External products can manage their separate product users through scoped APIs.
- External products can delegate end-user login to OneSysUser via client_id/client_secret and an SDK/API implementing an OAuth2/OIDC-style flow, receiving tokens plus role/permission data for the authenticated product user.
- Product ownership is not stored; organization role and workspace membership determine product management access.
