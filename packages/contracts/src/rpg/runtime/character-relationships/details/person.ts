import { z } from 'zod'

import { characterRelationshipLifecycleSchema } from '../../../vocab/character-relationship/lifecycle'

export const enduringPersonRelationshipDetailsSchema = z.object({}).strict()

export type EnduringPersonRelationshipDetails = z.infer<
  typeof enduringPersonRelationshipDetailsSchema
>

export const lifecyclePersonRelationshipDetailsSchema = z.object({
  lifecycle: characterRelationshipLifecycleSchema.default('current'),
})

export type LifecyclePersonRelationshipDetails = z.infer<
  typeof lifecyclePersonRelationshipDetailsSchema
>
