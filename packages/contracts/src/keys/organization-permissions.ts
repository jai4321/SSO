export const ORGANIZATION_PERMISSION = {
  readUsers: "organization.users.read",
  createUsers: "organization.users.create",
  manageUsers: "organization.users.manage",
  assignUserRoles: "organization.users.assign_role",
  createWorkspace: "workspace.create",
  manageWorkspaceProducts: "workspace.products.manage",
} as const;

export const organizationPermissionKeys = [
  ORGANIZATION_PERMISSION.readUsers,
  ORGANIZATION_PERMISSION.createUsers,
  ORGANIZATION_PERMISSION.manageUsers,
  ORGANIZATION_PERMISSION.assignUserRoles,
  ORGANIZATION_PERMISSION.createWorkspace,
  ORGANIZATION_PERMISSION.manageWorkspaceProducts,
] as const;

export type OrganizationPermissionKey = (typeof organizationPermissionKeys)[number];
