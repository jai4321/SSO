import { z } from "zod";

// Mirrors the API registerOrganizationSchema in apps/api.
export const registerOrganizationFormSchema = z.object({
  organizationName: z.string().trim().min(2).max(150),
  contactNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, "Invalid contact number"),
  address: z.object({
    addressLine1: z.string().trim().min(1).max(255),
    addressLine2: z.string().trim().max(255).optional(),
    country: z.string().regex(/^[A-Z]{2}$/, "Select a country"),
    state: z.string().trim().min(1).max(100),
    city: z.string().trim().min(1).max(100),
    pincode: z.string().trim().regex(/^[0-9]{4,10}$/, "Pincode must be numeric"),
  }),
  user: z.object({
    name: z.string().trim().min(1).max(150),
    email: z.string().trim().toLowerCase().email().max(255),
  }),
});

export type RegisterOrganizationFormValues = z.infer<typeof registerOrganizationFormSchema>;
