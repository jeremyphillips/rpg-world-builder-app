import { z } from 'zod'

import { characterRelationshipLifecycleSchema } from '../../../vocab/character-relationship/lifecycle'

export const membershipRelationshipDetailsSchema = z.object({
  lifecycle: characterRelationshipLifecycleSchema.default('current'),
  membershipTitleId: z.string().trim().min(1),
})

export type MembershipRelationshipDetails = z.infer<typeof membershipRelationshipDetailsSchema>
