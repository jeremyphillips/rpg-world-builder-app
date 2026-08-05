import { z } from 'zod'

import { territorialAuthorityKindSchema } from '../../vocab/location/territorial-authority'
import { territorialAuthorityRelationshipSchema } from './territorial-authority'

/** Body for nested POST …/territorial-authorities. */
export const createTerritorialAuthorityRelationshipInputSchema = z.object({
  id: z.string().min(1).optional(),
  organizationId: z.string().min(1),
  kind: territorialAuthorityKindSchema,
})

export type CreateTerritorialAuthorityRelationshipInput = z.infer<
  typeof createTerritorialAuthorityRelationshipInputSchema
>

/** Body for nested PATCH …/territorial-authorities/:relationshipId. */
export const updateTerritorialAuthorityRelationshipInputSchema = z
  .object({
    organizationId: z.string().min(1).optional(),
    kind: territorialAuthorityKindSchema.optional(),
  })
  .refine((value) => value.organizationId !== undefined || value.kind !== undefined, {
    message: 'At least one of organizationId or kind is required.',
  })

export type UpdateTerritorialAuthorityRelationshipInput = z.infer<
  typeof updateTerritorialAuthorityRelationshipInputSchema
>

export const territorialAuthorityMutationRelationshipSchema = territorialAuthorityRelationshipSchema
