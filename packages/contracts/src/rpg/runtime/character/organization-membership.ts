import { z } from 'zod'

import { characterOrganizationConnectionSchema } from './connections'

/** Body for nested POST …/organization-memberships. */
export const createCharacterOrganizationMembershipInputSchema =
  characterOrganizationConnectionSchema

export type CreateCharacterOrganizationMembershipInput = z.infer<
  typeof createCharacterOrganizationMembershipInputSchema
>

/**
 * Body for nested PATCH …/organization-memberships/:organizationId.
 *
 * `title` is required: a string sets it; `null` explicitly clears it.
 * Omission fails validation so accidental clears cannot happen via missing fields.
 */
export const updateCharacterOrganizationMembershipInputSchema = z.object({
  title: z.union([z.string().trim().min(1).max(80), z.null()]),
})

export type UpdateCharacterOrganizationMembershipInput = z.infer<
  typeof updateCharacterOrganizationMembershipInputSchema
>
