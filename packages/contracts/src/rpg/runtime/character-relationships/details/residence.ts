import { z } from 'zod'

import { characterRelationshipLifecycleSchema } from '../../../vocab/character-relationship/lifecycle'

export const residenceRelationshipDetailsSchema = z.object({
  lifecycle: characterRelationshipLifecycleSchema.default('current'),
  isPrimary: z.boolean().optional(),
})

export type ResidenceRelationshipDetails = z.infer<typeof residenceRelationshipDetailsSchema>
