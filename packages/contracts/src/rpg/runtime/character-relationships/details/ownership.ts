import { z } from 'zod'

import { characterRelationshipLifecycleSchema } from '../../../vocab/character-relationship/lifecycle'

export const ownershipRelationshipDetailsSchema = z.object({
  lifecycle: characterRelationshipLifecycleSchema.default('current'),
})

export type OwnershipRelationshipDetails = z.infer<typeof ownershipRelationshipDetailsSchema>
