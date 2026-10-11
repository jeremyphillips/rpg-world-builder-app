import { z } from 'zod'

import { equipmentModifierSchema } from './modifier'

/** Neutral equipment instance row shared by character inventory and monster gear. */
export const equipmentInstanceSchema = z.object({
  entryId: z.string().min(1).optional(),
  equipmentId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
  customName: z.string().min(1).optional(),
  customDescription: z.string().optional(),
  modifiers: z.array(equipmentModifierSchema).optional(),
})

export type EquipmentInstance = z.infer<typeof equipmentInstanceSchema>
