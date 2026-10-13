import { z } from 'zod'

import { equipmentMechanicalEffectSchema } from './effect'
import { equipmentMagicPropertyEntrySchema } from './magic-property'
import { equipmentModifierSchema } from './modifier'
import { normalizeEquipmentInstance } from './normalize-equipment-instance'
import { refineEquipmentInstanceInvariants } from './instance-invariants'

/**
 * Neutral equipment instance row shared by character inventory and monster gear.
 *
 * `equipped` means one unit of the entry is in use. `quantity` is how many are
 * owned. Differently customized copies are separate entries.
 */
export const equipmentInstanceSchemaBase = z.object({
  entryId: z.string().min(1).optional(),
  equipmentId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
  customName: z.string().min(1).optional(),
  customDescription: z.string().optional(),
  magical: z.boolean().optional(),
  magicProperties: z.array(equipmentMagicPropertyEntrySchema).optional(),
  mechanicalEffects: z.array(equipmentMechanicalEffectSchema).optional(),
  modifiers: z.array(equipmentModifierSchema).optional(),
})

export type EquipmentInstance = z.infer<typeof equipmentInstanceSchemaBase>

const equipmentInstanceSchemaParsed = equipmentInstanceSchemaBase.superRefine((entry, ctx) =>
  refineEquipmentInstanceInvariants(entry, ctx),
)

export const equipmentInstanceSchema = z.preprocess((value) => {
  if (!value || typeof value !== 'object') return value
  return normalizeEquipmentInstance(value as EquipmentInstance)
}, equipmentInstanceSchemaParsed)
