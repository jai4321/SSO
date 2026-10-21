import { FastifyRequest } from 'fastify';
import { UnauthorizedError } from '@/errors/app-error';
import { getAuthUserById } from '@/modules/auth/auth.service';
import type { OrganizationRole } from '@/types/fastify-jwt';

declare module 'fastify' {
  interface FastifyRequest {
    currentUser: {
      id: string;
      organizationId: string;
      organizationRole: OrganizationRole;
      permissions: string[];
    };
  }
}

// Verifies the Bearer access token and re-checks that the user is still active and not deleted.
export async function authenticate(req: FastifyRequest) {
  try {
    await req.jwtVerify();
  } catch {
    throw new UnauthorizedError('Missing or invalid access token');
  }

  if (req.user.type !== 'access') throw new UnauthorizedError('Invalid token type');

  const user = await getAuthUserById(req.user.sub);
  req.currentUser = user;
}
