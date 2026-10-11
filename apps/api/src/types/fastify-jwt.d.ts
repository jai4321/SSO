import '@fastify/jwt';

export type OrganizationRole = 'SUPERADMIN' | 'ADMIN' | 'MEMBER';

export interface AccessTokenPayload {
  sub: string;
  org: string;
  role: OrganizationRole;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tid: string;
  type: 'refresh';
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AccessTokenPayload | RefreshTokenPayload;
    user: AccessTokenPayload | RefreshTokenPayload;
  }
}
