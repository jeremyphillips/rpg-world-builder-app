import { z } from 'zod'

import { characterRelationshipLifecycleSchema } from '../../../vocab/character-relationship/lifecycle'

export const membershipRelationshipDetailsSchema = z.object({
  lifecycle: characterRelationshipLifecycleSchema.default('current'),
  title: z.string().trim().min(1).max(80).optional(),
  priority: z.number().int().optional(),
})

export type MembershipRelationshipDetails = z.infer<typeof membershipRelationshipDetailsSchema>
