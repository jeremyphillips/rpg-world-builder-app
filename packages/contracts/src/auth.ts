import { z } from "zod";

/** Shared password policy for auth inputs. Tighten (complexity) later if needed. */
export const passwordSchema = z.string().min(8).max(128);

export const loginInputSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z.object({
  email: z.email(),
  password: passwordSchema,
  displayName: z.string().min(1).max(80),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
