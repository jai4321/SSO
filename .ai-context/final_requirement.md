# OneSysUser - Final Requirement Document

## 1. Overview
OneSysUser is a multi-tenant organization access management system designed for companies that operate multiple products, workspaces, and teams. The system allows an organization to manage users, assign access, and control workspace-specific permissions efficiently.

The system is built around this hierarchy:
- organization users belong to an organization and have one built-in role: `SUPERADMIN`, `ADMIN`, or `MEMBER`
- workspaces belong to an organization and contain products
- workspace access is granted through explicit membership as an `ADMIN` or `MEMBER`
- products are shared resources inside a workspace and do not have an individual owner
- product users are separate accounts from organization users
- product roles and permissions are custom and scoped to one product
- the super admin has full control over the organization, users, workspaces, products, and product users
- each organization subscribes to a plan that limits how many workspaces, organization users, products, and product users it can create
- platform admins operate the system itself: they are separate from organization users and can view and manage all organizations and their plans

---

## 2. Product Goal
Organizations with multiple products, projects, or departments need a way to manage employee access across different workspaces without exposing organization-level control to every user.

The product should support:
- organization registration and admin setup
- user creation and management
- workspace creation and ownership
- workspace membership and invitations
- product creation and management
- product-user registration and authentication integration
- product-level custom roles and permissions/actions
- product access assignment to product users
- super-admin override capability
- auditability of permission changes

---

## 3. Core Business Concept
A company like Google may have multiple workspaces such as GOOGLE_OFFICE and GOOGLE_ENTERTAINMENT. Each workspace may contain products such as GMAIL, GOOGLE_SHEETS, YOUTUBE, and GOOGLE_MUSIC. Product users are the external customers or users of those products, not employees who administer the organization.

The system must support a structure where:
- Jai is the organization `SUPERADMIN`
- Rohit and Kamal are organization `ADMIN` users and have equal rights when both are invited as ADMIN members of a workspace
- Tanya is an organization `MEMBER` and can manage products only in workspaces where she is invited
- all active workspace members can see and manage products in that workspace according to their organization role
- each product defines its own roles and permissions for product users
- external product systems use scoped APIs to manage their product users and authentication

---

## 4. Actors / Roles

### 4.1 Organization SUPERADMIN
The organization super admin is the owner of the organization. This user has full access to the organization and every workspace in it.

Responsibilities:
- register organization details
- create and manage any organization user
- create and manage any workspace and product
- manage product users and product access
- override permissions and restrictions when necessary

Example: Jai

### 4.2 Organization ADMIN
An organization ADMIN is an employee authorized to create permitted organization users, create workspaces, invite other organization users, and manage workspaces where they are the creator or an invited ADMIN member.

Responsibilities:
- log in to the system
- create permitted organization users
- create workspaces
- invite ADMIN and MEMBER users to workspaces
- manage products in accessible workspaces

Example: Rohit and Kamal

### 4.3 Organization MEMBER
An organization MEMBER cannot create organization users or workspaces. A MEMBER can manage products and product users only in workspaces where they are explicitly invited.

Responsibilities:
Example: Tanya

### 4.4 Product User
A product user is an external user of a product such as YOUTUBE.COM. Product users are separate from organization users and cannot manage the organization or workspace.

Responsibilities:
- authenticate through the product's integration
- access only actions allowed by product roles and permissions
- have no implicit access to other products

### 4.5 External Product System (Client Integration)
An external product system is the actual product application (for example, YOUTUBE.COM) that integrates with OneSysUser as its identity and authorization backend using an issued client_id/client_secret and the OneSysUser SDK/API.

Responsibilities:
- redirect or delegate end-user login to OneSysUser using the product's client credentials (OAuth2/OIDC-style flow)
- receive access/refresh tokens for the authenticated product user
- call scoped APIs to fetch the product user's profile, roles, and permissions
- verify or refresh tokens as needed
- never access data belonging to another product

### 4.6 Platform Admin (System Owner)
A platform admin operates the OneSysUser system itself. Platform admins are not organization users and exist in a completely separate identity store with a separate login.

Responsibilities:
- view all registered organizations and their usage (workspace, product, organization user, and product user counts)
- create and manage plans and their limits
- change an organization's plan and activate or deactivate an organization
- never manage organization-internal data (users, workspaces, products, roles) - platform access is cross-tenant oversight, not tenant administration

---

## 5. User Stories

### User Story 1: Organization Registration
As the organization super admin, Jai wants to register the organization with details such as name, address, and contact information so the company can use OneSysUser.

### User Story 2: Admin Account Creation
As the organization super admin, Jai wants to create his own administrator account so he can securely manage the organization.

### User Story 3: Login
As the super admin, Jai wants to log in with valid credentials so he can access the organization dashboard.

### User Story 4: User Creation
As the organization super admin, Jai wants to create user accounts for employees so that users can be added to the organization and assigned to workspaces.

### User Story 5: Organization Role Access
As an organization employee, I receive SUPERADMIN, ADMIN, or MEMBER capabilities and can access only the users, workspaces, and products allowed by that role and my workspace memberships.

### User Story 6: Workspace Creation and Invitation
As an ADMIN, I want to create a workspace and invite other ADMIN or MEMBER organization users so they can work in that workspace.

### User Story 7: Shared Workspace Administration
As a workspace ADMIN, I want to manage a workspace where I am an ADMIN member, regardless of which ADMIN created it.

### User Story 8: Product Creation
As an authorized workspace member, I want to create products inside an accessible workspace.

### User Story 9: Product Roles and Permissions
As a product manager, I want to create custom roles and permissions for one product's features.

### User Story 10: Product User Management
As an external product system, I want to register, authenticate, and manage product users through a product-scoped API.

### User Story 11: Super Admin Override
As the organization super admin, Jai wants to override workspace permissions when necessary so he can maintain authority over the organization and its security.

### User Story 12: Plan Limits
As the platform owner, I want each organization to subscribe to a plan so that organizations can only create as many workspaces, users, products, and product users as their plan allows.

### User Story 13: Platform Administration
As a platform admin, I want to see every registered organization with its usage statistics and manage its plan so I can operate the business.

---

## 6. Functional Requirements

### 6.1 Organization Management
- The system shall allow an organization to register with basic company information.
- The system shall store organization details such as name, address, and contact information.
- The system shall support the fixed organization roles SUPERADMIN, ADMIN, and MEMBER.
- SUPERADMIN shall have full access to all organization resources.
- ADMIN shall manage permitted users and workspaces they created or where they are invited as ADMIN.
- MEMBER shall manage products and product users only in invited workspaces.
- The system shall allow the super admin to manage organization-level details.

### 6.2 User Management
- The system shall allow SUPERADMIN and permitted ADMIN users to create organization users.
- The system shall allow unique login credentials for each user.
- The system shall support user activation and deactivation.
- The system shall prevent MEMBER users from managing organization users, workspaces, and organization settings.

### 6.3 Workspace Management
- The system shall allow SUPERADMIN and ADMIN users to create workspaces.
- A workspace shall belong to one organization.
- A workspace shall have one or more ADMIN members and may have MEMBER members.
- ADMIN members shall have equal workspace management rights.
- The system shall restrict access to a workspace unless the user has explicit membership or SUPERADMIN access.

### 6.4 Product Management
- The system shall allow authorized workspace members to create products.
- Products shall belong to exactly one workspace.
- Products shall not have an individual owner; all eligible workspace members can manage them.

### 6.5 Product Permission Management
- The system shall allow product managers to create custom roles and permissions for one product.
- Permissions may represent a business action or feature.
- Example permissions include:
  - add_video_to_favourites
  - 1440p_resolution_premium
  - no_ads
  - watch_premium_content
  - manage_users
  - create_content
  - delete_content
- The system shall allow permissions to be assigned to product roles.

### 6.6 Product User Access
- The system shall allow product systems to create and manage separate product users.
- The system shall assign product roles to product users.
- The system shall evaluate access using roles and permissions scoped to one product.
- A product user without the relevant permission shall not perform restricted product actions.
- Product users shall not receive organization-user access implicitly.

### 6.6a Product Client Integration (Credentials, Login, and Data Access)
- The system shall issue exactly one client_id and client_secret pair per product, generated when the product is created or on demand by an authorized workspace member.
- The system shall allow any workspace member authorized to manage the product (per section 6.4/6.6 rules) to view the client_id, rotate the client_secret, and enable/disable the product's integration.
- Rotating or revoking a client_secret shall immediately invalidate tokens previously issued under the old secret.
- The system shall provide an SDK/library and API that lets the external product perform an OAuth2/OIDC-style login flow: the product's end-user is authenticated by OneSysUser (not by the product itself), and OneSysUser issues access and refresh tokens scoped to that product and that product user.
- The system shall provide scoped APIs for the external product, authenticated with its client credentials and/or the issued product-user token, to:
  - register or provision a product user
  - authenticate/login a product user and receive tokens
  - fetch the authenticated product user's profile
  - fetch the product user's assigned roles and permissions
  - verify and refresh access tokens
- All client-credential and product-user token operations shall be scoped to a single product; a product's credentials shall never grant access to another product's users, roles, or permissions.
- The system shall log client_secret rotation/revocation and integration enable/disable events in the audit log.

### 6.7 Super Admin Override
- The organization SUPERADMIN shall have unrestricted access to all organization resources.
- The super admin shall be able to override any permission or restriction when necessary.
- All override actions shall be recorded in an audit log.

### 6.8 Audit and Logging
- The system shall maintain an audit log for user creation, workspace membership, workspace/product creation, product-user changes, role assignment, permission assignment, and access override operations.
- The system shall store who changed what, and when.

### 6.9 Plans and Billing Limits
- The organization is the sold entity: one customer operates exactly one organization.
- The system shall support plans with organization-wide limits on workspaces, organization users, products, and product users.
- New organizations shall be assigned the default plan on registration.
- When an organization reaches a plan limit, creation of that resource shall be blocked with an upgrade-plan response.
- Plan downgrades shall not delete existing data; they only block new creation while the organization is over the limit.
- Only platform admins can manage plans and change an organization's plan.

### 6.10 Platform Administration
- The system shall provide platform admins as a separate identity with separate login and token scope, independent of organization users.
- Platform tokens shall never grant access to organization APIs, and organization tokens shall never grant access to platform APIs.
- The system shall let platform admins list all organizations with usage statistics and view organization details.
- The system shall let platform admins change an organization's plan and activate or deactivate an organization.
- All platform admin actions shall be recorded in the audit log.

---

## 7. Business Rules
1. Only the organization super admin can manage organization-level settings.
2. MEMBER users cannot manage organization users, workspaces, or organization settings.
3. Workspace ADMIN membership grants equal workspace management rights.
4. MEMBER users can create/manage products only in explicitly invited workspaces.
5. Products are shared workspace resources and have no individual owner.
6. A user can belong to multiple workspaces but access is checked separately for each workspace.
7. Product roles can contain multiple product permissions.
8. Product permissions are scoped to a specific product.
9. Product users and organization users are separate identities.
10. If a product user is removed from a product, all product access is revoked automatically.
11. If a product permission is removed from a role, assigned product users lose that permission immediately.
12. The SUPERADMIN has ultimate control over all organization resources.
13. Each product has exactly one active client_id/client_secret pair; rotating the secret immediately invalidates tokens issued under the previous secret.
14. A product's client credentials and product-user tokens are scoped strictly to that product and shall never grant access to another product.
15. One customer operates exactly one organization; plans and limits apply per organization.
16. Creation of workspaces, organization users, products, and product users is blocked once the organization's plan limit is reached.
17. Platform admins are separate identities with audited, cross-tenant oversight; they cannot manage organization-internal data.

---

## 8. Example Scenario
### Scenario A: Workspace and Product Access
Rohit creates a workspace named GOOGLE_ENTERTAINMENT and invites Kamal as an ADMIN and Tanya as a MEMBER.

Tanya creates a product named YOUTUBE.

YOUTUBE defines a product role named premium_users with the following permissions:
- add_video_to_favourites
- 1440p_resolution_premium
- no_ads
- watch_premium_content

YOUTUBE assigns this role to selected YOUTUBE product users.

Result:
- Members of premium_users can access premium features in YOUTUBE.
- Rohit, Kamal, and Tanya can manage YOUTUBE because they are members of the workspace.
- A product user of YOUTUBE is not an organization user and cannot manage GOOGLE_ENTERTAINMENT.
- Jai, as SUPERADMIN, can access and manage the organization, workspace, product, and product users.

---

## 9. Non-Functional Requirements
- The system shall support multiple organizations and multiple workspaces.
- Authorization checks must be fast and efficient.
- The system shall be secure and enforce access rules consistently.
- Access changes shall be auditable.
- The application shall support organization roles, workspace membership roles, and product-scoped roles and permissions.
- The system shall maintain data integrity across user, workspace, group, and permission records.

---

## 10. Proposed MVP Scope
The first version of the product should include the following:
- organization registration and authentication
- SUPERADMIN, ADMIN, and MEMBER organization roles
- organization user creation and workspace invitations
- workspace creation and membership enforcement
- product creation
- separate product-user integration API
- product roles and permissions
- product-user role assignment
- super admin override
- basic audit log

This MVP is enough to validate the core value of custom workspace access management.

---

## 11. Out of Scope for MVP
The following are not required in the initial version:
- enterprise SSO / external authentication providers beyond product integration
- real payment processing/gateways, invoicing, and self-service checkout (plan management and limits themselves are in scope)
- advanced analytics dashboards
- AI-based access recommendations
- multi-language support
- complex approval workflows
- advanced reporting modules

---

## 12. Acceptance Criteria

### AC1: Super Admin Access
Given Jai is the organization SUPERADMIN, when he logs in, then he shall have full access to the organization, all workspaces, products, and product users.

### AC2: Non-Admin Restriction
Given Tanya is an organization MEMBER, when she tries to create an organization user or access a workspace where she is not a member, then access shall be denied.

### AC3: Workspace Creation
Given Rohit is an organization ADMIN, when he creates a workspace, then the workspace shall be created successfully and Rohit shall become an ADMIN member.

### AC4: Workspace Membership Restriction
Given Tanya is not a member of GOOGLE_ENTERTAINMENT, when Tanya tries to access or manage its products, then access shall be denied.

### AC5: Permission Creation
Given Tanya creates the YOUTUBE product, when YOUTUBE defines a permission such as no_ads, then that permission shall be available only within YOUTUBE.

### AC6: Product Role Assignment
Given YOUTUBE creates a premium_users role with permissions, when YOUTUBE assigns the role to a product user, then that product user shall receive those permissions only for YOUTUBE.

### AC7: Override Operation
Given Jai is the super admin, when he overrides a workspace permission, then the override shall be accepted and recorded in the audit log.

### AC8: Client Credential Scoping
Given YOUTUBE has an issued client_id/client_secret, when YOUTUBE's SDK authenticates a product user and requests that user's roles and permissions, then only YOUTUBE-scoped data shall be returned and no other product's data shall be accessible.

### AC9: Secret Rotation
Given a workspace member managing YOUTUBE rotates its client_secret, when a request is made using the previous secret or a token issued under it, then the request shall be rejected.

---

## 13. Phase-wise Plan

### Phase 1 - Foundation
- organization registration
- admin setup
- login and authentication
- user management
- workspace creation

### Phase 2 - Workspace Authorization
- organization role enforcement
- workspace membership and invitations
- workspace ADMIN management
- restrictions for non-members

### Phase 3 - Product Foundation
- product creation and shared product management
- separate product users
- product client credentials (client_id/client_secret) issuance and rotation
- OAuth2/OIDC-style product login SDK/API (product delegates end-user login to OneSysUser)
- scoped integration APIs for product-user registration, authentication, profile, roles, and permissions

### Phase 4 - Product Authorization and Lifecycle
- product roles and permissions
- product feature/menu management
- audit logs and access review
- transfer, archive, deletion, and MFA/OTP workflows
- bulk operations, reports, and notifications

### Phase 5 - Billing (Plans) and Platform Admin
- plans with per-organization limits (workspaces, organization users, products, product users)
- plan limit enforcement with upgrade-plan responses
- platform admin identity with separate login and token scope
- platform admin panel: organization list with usage stats, plan management, organization activation/deactivation

### Phase 6 - Deployment and DevOps
- production Docker images and compose setup
- Redis/Postgres hardening, secrets management
- CI/CD pipeline, observability, security hardening

---

## 14. Final Summary
This system is a multi-tenant organization, workspace, and product access-control platform. Organization roles control administrative scope, workspace membership controls product visibility, and product roles and permissions control the actions available to separate product users.

The central design principle is:
- SUPERADMIN controls the organization and all resources
- ADMINs manage workspaces where they are ADMIN members
- MEMBERs manage products in invited workspaces
- product users receive access through product roles and permissions
- product permissions are evaluated at the product level
- external products use scoped APIs to manage their own product users
- plans cap what each organization can create
- platform admins oversee all organizations without being organization users

This requirement document provides the foundation for the system design and the phased implementation plan.
