import { z } from 'zod'

import { overlaySlugList } from '../lib/system-overlay/overlay-presets'

import { equipmentCostSchema } from '../../primitives/money'
import { weightSchema } from '../../primitives/units'
import { mediaBearingAuthoredContentBodySchema } from '../lib/media/media-bearing-content'

/** Shared body fields present on every equipment union variant. */
export const equipmentBaseSchema = mediaBearingAuthoredContentBodySchema.extend({
  cost: equipmentCostSchema,
  weight: weightSchema.optional(),
  tags: overlaySlugList(z.string()).optional(),
})

export type EquipmentBaseFields = z.infer<typeof equipmentBaseSchema>
