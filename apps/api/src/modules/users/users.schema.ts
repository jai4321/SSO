import { z } from 'zod';

export const organizationRoleSchema = z.enum(['SUPERADMIN', 'ADMIN', 'MEMBER']);

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().toLowerCase().email().max(255),
  organizationRole: organizationRoleSchema,
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    organizationRole: organizationRoleSchema.optional(),
  })
  .refine((value) => value.name !== undefined || value.organizationRole !== undefined, {
    message: 'At least one field must be provided',
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
