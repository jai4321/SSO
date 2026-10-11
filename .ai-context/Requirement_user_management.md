# User Stories.
1. A person named Jai, who is the administrator of a company like Google, wants to manage organization users and the product access systems for products such as Gmail, YouTube, and Google Music.
2. Now jai registered its organization to a system (lets name it "OneSysUser") with basic details of Organization like name, address, and contact information.and also created an administrator account for himself to manage the organization's user accounts. organization and person of control details are necessary.
3. after setup organization and administrator account, Jai can now login to OneSysUser using his administrator account credentials. after verification.
4. Once Logged in, there are several things jai can do such as
   - Create new user accounts for employees within the organization.
   - Assign roles and permissions to users based on their responsibilities.
   - SUPERADMIN and ADMIN users can create workspaces for business areas such as office operations and entertainment.
   - ADMIN users can invite other ADMIN or MEMBER organization users into a workspace.
   - Workspace ADMIN members have equal rights to manage that workspace.
   - Workspace members can create and manage shared products inside that workspace.
   - Products define their own roles and permissions for separate product users.
   - Super user Jai has the ultimate control over all workspaces and can override permissions if necessary.

# Purpose
- I want organizations that have multiple projects to be able to use this system to manage users and their access to different workspaces efficiently.

# Current Product Model
- Organization users have one fixed role: `SUPERADMIN`, `ADMIN`, or `MEMBER`.
- `SUPERADMIN` can manage every organization user, workspace, product, and product user.
- `ADMIN` can create permitted organization users, create workspaces, and manage workspaces where they are the creator or an invited workspace ADMIN.
- `MEMBER` cannot create organization users or workspaces and can manage products only in invited workspaces.
- The hierarchy is `Organization -> Workspace -> Product`.
- Workspace ADMINs have equal rights; products do not have individual owners.
- Product users are separate identities from organization users. External products use scoped APIs for product-user registration, authentication, roles, and permissions.

## Now tell me what i missing in this requirement document.