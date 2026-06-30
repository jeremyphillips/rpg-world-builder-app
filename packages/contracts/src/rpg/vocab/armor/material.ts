import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Armor material — drives the druid non-metal rule and flavor display.
// ---------------------------------------------------------------------------

export const ARMOR_MATERIALS = ['organic', 'metal'] as const

export const armorMaterialSchema = z.enum(ARMOR_MATERIALS)

export type ArmorMaterial = z.infer<typeof armorMaterialSchema>

export const ARMOR_MATERIAL_ENTRIES = {
  organic: {
    label: 'Non-Metal',
    description:
      'Made from organic materials such as leather, hide, or wood. Druids will not wear armor made of metal.',
  },
  metal: {
    label: 'Metal',
    description: 'Made from metal such as chain, scale, or plate.',
  },
} as const satisfies Record<ArmorMaterial, GameTermEntry>

/** Returns the reference entry for an armor material, if known. */
export function getArmorMaterialEntry(m: string): GameTermEntry | undefined {
  return ARMOR_MATERIAL_ENTRIES[m as ArmorMaterial]
}

/** Returns the display label for an armor material. Falls back to the raw value. */
export function getArmorMaterialLabel(m: string): string {
  return getArmorMaterialEntry(m)?.label ?? m
}
