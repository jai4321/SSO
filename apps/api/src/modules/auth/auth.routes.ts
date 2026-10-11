import { randomUUID } from 'node:crypto';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { env } from '@/config/env';
import { UnauthorizedError } from '@/errors/app-error';
import { authenticate } from '@/middlewares/authenticate';
import type { RefreshTokenPayload } from '@/types/fastify-jwt';
import { loginSchema, logoutSchema, refreshSchema, setPasswordSchema } from './auth.schema';
import {
  getAuthUserById,
  removeSession,
  rotateSession,
  setPassword,
  storeSession,
  validateCredentials,
  type AuthUser,
} from './auth.service';

const issueTokens = (app: FastifyInstance, user: AuthUser) => {
  const tokenId = randomUUID();
  const accessToken = app.jwt.sign(
    { sub: user.id, org: user.organizationId, role: user.organizationRole, type: 'access' },
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
  );
  const refreshToken = app.jwt.sign(
    { sub: user.id, tid: tokenId, type: 'refresh' },
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN },
  );
  return { tokenId, accessToken, refreshToken };
};

const verifyRefreshToken = (app: FastifyInstance, token: string): RefreshTokenPayload => {
  let payload: RefreshTokenPayload;
  try {
    payload = app.jwt.verify<RefreshTokenPayload>(token);
  } catch {
    throw new UnauthorizedError('Refresh token is invalid or has expired');
  }
  if (payload.type !== 'refresh' || !payload.tid) {
    throw new UnauthorizedError('Refresh token is invalid or has expired');
  }
  return payload;
};

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (req) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await validateCredentials(email, password);
    const { tokenId, accessToken, refreshToken } = issueTokens(app, user);
    await storeSession(user.id, tokenId, refreshToken);
    return { accessToken, refreshToken };
  });

  app.post(
    '/refresh',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req) => {
      const { refreshToken } = refreshSchema.parse(req.body);
      const payload = verifyRefreshToken(app, refreshToken);
      await rotateSession(payload.sub, payload.tid, refreshToken);

      const user = await getAuthUserById(payload.sub);
      const { tokenId, accessToken, refreshToken: newRefreshToken } = issueTokens(app, user);
      await storeSession(user.id, tokenId, newRefreshToken);
      return { accessToken, refreshToken: newRefreshToken };
    },
  );

  app.post('/logout', async (req) => {
    const { refreshToken } = logoutSchema.parse(req.body);
    // Logout is idempotent: an invalid or expired token means the session is already gone.
    let payload: RefreshTokenPayload;
    try {
      payload = app.jwt.verify<RefreshTokenPayload>(refreshToken);
    } catch {
      return { message: 'Logged out' };
    }
    // Revocation failures must surface (500 via the global handler) instead of pretending success.
    if (payload.type === 'refresh' && payload.tid) {
      await removeSession(payload.sub, payload.tid);
    }
    return { message: 'Logged out' };
  });

  app.post(
    '/set-password',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req) => {
      const { token, password } = setPasswordSchema.parse(req.body);
      await setPassword(token, password);
      return { message: 'Password set. You can now log in.' };
    },
  );

  app.get('/me', { preHandler: authenticate }, async (req) => ({ user: req.currentUser }));
};
