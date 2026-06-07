import { z } from 'zod'
import { platformRoleSchema } from './roles'

/** Canonical user as exposed by the API (never includes the password hash). */
export const userSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  displayName: z.string().min(1).max(80),
  role: platformRoleSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type User = z.infer<typeof userSchema>

/** Subset returned from `GET /auth/me` and embedded in the client session. */
export const sessionUserSchema = userSchema.pick({
  id: true,
  email: true,
  displayName: true,
  role: true,
})

export type SessionUser = z.infer<typeof sessionUserSchema>
