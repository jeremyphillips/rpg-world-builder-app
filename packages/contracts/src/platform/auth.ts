import { z } from 'zod'

/** Shared password policy for auth inputs. Tighten (complexity) later if needed. */
export const passwordSchema = z.string().min(8).max(128)

export const loginInputSchema = z.object({
  email: z.email(),
  password: passwordSchema,
})

export type LoginInput = z.infer<typeof loginInputSchema>

export const registerInputSchema = z.object({
  email: z.email(),
  password: passwordSchema,
  displayName: z.string().min(1).max(80),
})

export type RegisterInput = z.infer<typeof registerInputSchema>

/**
 * Input for `PATCH /api/users/me/password`. `confirmNewPassword` is validated
 * client-side only and must NOT be included in this API schema — the server
 * has no use for it and we avoid sending an extra copy of the plaintext
 * password over the wire.
 */
export const changePasswordInputSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
})

export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>
