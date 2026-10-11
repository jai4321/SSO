import { FastifyPluginAsync } from 'fastify';
import { redis } from '@/lib/redis';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/healthz', async () => ({ status: 'ok' }));

  app.get('/readyz', async (_req, reply) => {
    try {
      await db.execute(sql`SELECT 1`);
      await redis.ping();
      return { status: 'ready' };
    } catch (err) {
      app.log.error(err);
      return reply.status(503).send({ status: 'not-ready' });
    }
  });
};
