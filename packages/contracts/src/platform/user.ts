import { z } from 'zod'
import { platformRoleSchema } from './roles'

/** Canonical user as exposed by the API (never includes the password hash). */
export const userSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  displayName: z.string().min(1).max(80),
  role: platformRoleSchema,
  avatarKey: z.string().optional(),
  /** The campaign this user most recently selected; drives the dashboard landing redirect. */
  lastSelectedCampaignId: z.string().min(1).nullable(),
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
  avatarKey: true,
  lastSelectedCampaignId: true,
})

export type SessionUser = z.infer<typeof sessionUserSchema>

/** Resolved active campaign returned from `GET /api/auth/me`. */
export const activeCampaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

export type ActiveCampaign = z.infer<typeof activeCampaignSchema>

/** Full payload from `GET /api/auth/me`. Login/register return `{ user }` only. */
export const authMeResponseSchema = z.object({
  user: sessionUserSchema,
  activeCampaign: activeCampaignSchema.nullable(),
})

export type AuthMeResponse = z.infer<typeof authMeResponseSchema>

/**
 * Input for `PATCH /api/users/me`. All fields are optional; the server merges
 * the patch. Email changes take effect immediately — see docs/security.md for
 * the planned verification step.
 */
export const updateProfileInputSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  email: z.email().optional(),
  avatarKey: z.string().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>
