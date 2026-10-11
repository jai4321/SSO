import { FastifyPluginAsync } from 'fastify';
import {
  registerOrganizationSchema,
  resendVerificationSchema,
  verifyOrganizationSchema,
} from './organizations.schema';
import {
  registerOrganization,
  resendVerification,
  verifyOrganization,
} from './organizations.service';

const emailRouteLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

export const organizationRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', emailRouteLimit, async (req, reply) => {
    const input = registerOrganizationSchema.parse(req.body);
    await registerOrganization(input);
    return reply.status(201).send({
      message: 'Organization registered. Check your email to verify the organization.',
    });
  });

  app.post('/verify', emailRouteLimit, async (req) => {
    const { token } = verifyOrganizationSchema.parse(req.body);
    const { setPasswordToken } = await verifyOrganization(token);
    return { message: 'Organization verified', setPasswordToken };
  });

  app.post('/resend-verification', emailRouteLimit, async (req) => {
    const input = resendVerificationSchema.parse(req.body);
    await resendVerification(input);
    return { message: 'If the email is registered and unverified, a new verification link has been sent.' };
  });
};
