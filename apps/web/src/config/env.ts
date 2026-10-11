import { z } from "zod";

// Server-only variables — never import serverEnv into client components.
const serverEnvSchema = z.object({});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:4000"),
});

export const serverEnv = serverEnvSchema.parse({});
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
