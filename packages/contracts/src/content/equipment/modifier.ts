import { z } from 'zod'

import { type GearKind } from '../../vocab/equipment/gear-kind'

// ---------------------------------------------------------------------------
// Equipment modifiers — per-copy overlays on catalog items (spellcasting focus,
// future enhancement bonuses, magical properties). Shared by starting equipment
// authoring and resolved character inventory rows.
// ---------------------------------------------------------------------------

export const EQUIPMENT_MODIFIER_KINDS = ['spellcasting_focus'] as const

export const equipmentModifierKindSchema = z.enum(EQUIPMENT_MODIFIER_KINDS)

export type EquipmentModifierKind = z.infer<typeof equipmentModifierKindSchema>

export const SPELLCASTING_FOCUS_GEAR_KINDS = [
  'arcane_focus',
  'druidic_focus',
  'holy_symbol',
] as const satisfies readonly GearKind[]

export type SpellcastingFocusGearKind = (typeof SPELLCASTING_FOCUS_GEAR_KINDS)[number]

export const spellcastingFocusGearKindSchema = z.enum(SPELLCASTING_FOCUS_GEAR_KINDS)

export const spellcastingFocusModifierSchema = z
  .object({
    kind: z.literal('spellcasting_focus'),
    focusKind: spellcastingFocusGearKindSchema,
  })
  .strict()

export type SpellcastingFocusModifier = z.infer<typeof spellcastingFocusModifierSchema>

export const equipmentModifierSchema = z.discriminatedUnion('kind', [
  spellcastingFocusModifierSchema,
])

export type EquipmentModifier = z.infer<typeof equipmentModifierSchema>

/** Validates that a gear kind is a valid spellcasting focus modifier target. */
export function isSpellcastingFocusGearKind(kind: GearKind): kind is SpellcastingFocusGearKind {
  return (SPELLCASTING_FOCUS_GEAR_KINDS as readonly string[]).includes(kind)
}
