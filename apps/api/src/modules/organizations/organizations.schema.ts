import { z } from 'zod';

export const registerOrganizationSchema = z.object({
  organizationName: z.string().trim().min(2).max(150),
  contactNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, 'Invalid contact number'),
  address: z.object({
    addressLine1: z.string().trim().min(1).max(255),
    addressLine2: z.string().trim().max(255).optional(),
    country: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, 'Country must be an ISO 3166-1 alpha-2 code'),
    state: z.string().trim().min(1).max(100),
    city: z.string().trim().min(1).max(100),
    pincode: z.string().trim().regex(/^[0-9]{4,10}$/, 'Pincode must be numeric'),
  }),
  user: z.object({
    name: z.string().trim().min(1).max(150),
    email: z.string().trim().toLowerCase().email().max(255),
  }),
});

export const verifyOrganizationSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid token'),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

export type RegisterOrganizationInput = z.infer<typeof registerOrganizationSchema>;
export type VerifyOrganizationInput = z.infer<typeof verifyOrganizationSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
