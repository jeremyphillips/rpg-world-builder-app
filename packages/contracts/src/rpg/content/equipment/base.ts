import { z } from 'zod'

import { equipmentCostSchema, weightSchema } from '../../primitives/units'
import { contentBodyBaseSchema } from '../lib/envelope'

/** Shared body fields present on every equipment union variant. */
export const equipmentBaseSchema = contentBodyBaseSchema.extend({
  cost: equipmentCostSchema,
  weight: weightSchema.optional(),
  tags: z.array(z.string()).optional(),
})

export type EquipmentBaseFields = z.infer<typeof equipmentBaseSchema>
