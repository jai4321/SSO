import { FastifyPluginAsync } from 'fastify';
import { requirePermission } from '@/guards/require-permission';
import { authenticate } from '@/middlewares/authenticate';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamSchema,
} from './users.schema';
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  resendInvitation,
  setUserActive,
  updateUser,
} from './users.service';

// Coarse grants are role-based; ownership and role-assignment limits remain in the service.
const canReadUsers = requirePermission('organization.users.read');
const canCreateUsers = requirePermission('organization.users.create');
const canManageUsers = requirePermission('organization.users.manage');
const emailRouteLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.post('/', { preHandler: canCreateUsers, ...emailRouteLimit }, async (req, reply) => {
    const input = createUserSchema.parse(req.body);
    const user = await createUser(req.currentUser, input);
    return reply.status(201).send({ user });
  });

  app.get('/', { preHandler: canReadUsers }, async (req) => {
    const query = listUsersQuerySchema.parse(req.query);
    return listUsers(req.currentUser, query);
  });

  app.get('/:id', { preHandler: canReadUsers }, async (req) => {
    const { id } = userIdParamSchema.parse(req.params);
    const user = await getUser(req.currentUser, id);
    return { user };
  });

  app.patch('/:id', { preHandler: canManageUsers }, async (req) => {
    const { id } = userIdParamSchema.parse(req.params);
    const input = updateUserSchema.parse(req.body);
    const user = await updateUser(req.currentUser, id, input);
    return { user };
  });

  app.patch('/:id/activate', { preHandler: canManageUsers }, async (req) => {
    const { id } = userIdParamSchema.parse(req.params);
    const user = await setUserActive(req.currentUser, id, true);
    return { user };
  });

  app.patch('/:id/deactivate', { preHandler: canManageUsers }, async (req) => {
    const { id } = userIdParamSchema.parse(req.params);
    const user = await setUserActive(req.currentUser, id, false);
    return { user };
  });

  app.delete('/:id', { preHandler: canManageUsers }, async (req) => {
    const { id } = userIdParamSchema.parse(req.params);
    await deleteUser(req.currentUser, id);
    return { message: 'User deleted' };
  });

  app.post('/:id/resend-invitation', { preHandler: canManageUsers, ...emailRouteLimit }, async (req) => {
    const { id } = userIdParamSchema.parse(req.params);
    await resendInvitation(req.currentUser, id);
    return { message: 'Invitation email resent' };
  });
};
