import { z } from 'zod'

import { spellcastingFocusGearKindSchema } from '../../vocab/equipment/spellcasting-gear-kind'

// ---------------------------------------------------------------------------
// Equipment modifiers — per-copy overlays on catalog items (spellcasting focus,
// future enhancement bonuses, magical properties). Shared by starting equipment
// authoring and resolved character inventory rows.
// ---------------------------------------------------------------------------

export const EQUIPMENT_MODIFIER_KINDS = ['spellcasting_focus'] as const

export const equipmentModifierKindSchema = z.enum(EQUIPMENT_MODIFIER_KINDS)

export type EquipmentModifierKind = z.infer<typeof equipmentModifierKindSchema>

export {
  SPELLCASTING_FOCUS_GEAR_KINDS,
  spellcastingFocusGearKindSchema,
  type SpellcastingFocusGearKind,
} from '../../vocab/equipment/spellcasting-gear-kind'

export const spellcastingFocusModifierSchema = z
  .object({
    kind: z.literal('spellcasting_focus'),
    spellcastingGearKind: spellcastingFocusGearKindSchema,
  })
  .strict()

export type SpellcastingFocusModifier = z.infer<typeof spellcastingFocusModifierSchema>

export const equipmentModifierSchema = z.discriminatedUnion('kind', [
  spellcastingFocusModifierSchema,
])

export type EquipmentModifier = z.infer<typeof equipmentModifierSchema>
