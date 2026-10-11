import { FastifyRequest } from 'fastify';
import { ForbiddenError } from '@/errors/app-error';
import type { OrganizationRole } from '@/types/fastify-jwt';

// Route-level gate by organization role; attach as preHandler after `authenticate`.
// Ownership/scope rules (e.g. "ADMIN manages users they created") stay in the services.
export const requireOrgRole =
  (...roles: OrganizationRole[]) =>
  async (req: FastifyRequest) => {
    if (!roles.includes(req.currentUser.organizationRole)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
  };
