import { FastifyRequest } from 'fastify';
import { ForbiddenError } from '@/errors/app-error';
import type { PermissionKey } from '@/db/schema/permission';

export const requirePermission = (permission: PermissionKey) => async (req: FastifyRequest) => {
  if (!req.currentUser.permissions.includes(permission)) {
    throw new ForbiddenError('You do not have permission to perform this action');
  }
};
