import { z } from 'zod'

import { equipmentCostSchema } from '../../primitives/money'
import { weightSchema } from '../../primitives/units'
import { mediaBearingAuthoredContentBodySchema } from '../../../shared/media/media-bearing-content'

/** Shared body fields present on every equipment union variant. */
export const equipmentBaseSchema = mediaBearingAuthoredContentBodySchema.extend({
  cost: equipmentCostSchema,
  weight: weightSchema.optional(),
  tags: z.array(z.string()).optional(),
})

export type EquipmentBaseFields = z.infer<typeof equipmentBaseSchema>
