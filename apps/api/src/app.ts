import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { env } from '@/config/env';
import { healthRoutes } from '@/routes/health';
import { authRoutes } from '@/modules/auth/auth.routes';
import { organizationRoutes } from '@/modules/organizations/organizations.routes';
import { userRoutes } from '@/modules/users/users.routes';
import { registerErrorHandlers } from '@/errors/error-handler';

export function buildApp() {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty' } }
        : true,
  });

  app.register(helmet);
  app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  app.register(sensible);
  app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  app.register(jwt, { secret: env.JWT_SECRET });
  registerErrorHandlers(app);
  app.register(healthRoutes);
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(organizationRoutes, { prefix: '/api/organizations' });
  app.register(userRoutes, { prefix: '/api/users' });

  return app;
}
