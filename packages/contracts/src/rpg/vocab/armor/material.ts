import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Armor material — drives the druid non-metal rule and flavor display.
// ---------------------------------------------------------------------------

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
} as const satisfies Record<string, GameTermEntry>

export type ArmorMaterial = keyof typeof ARMOR_MATERIAL_ENTRIES

export const ARMOR_MATERIALS = keysFromEntries(ARMOR_MATERIAL_ENTRIES)

export const armorMaterialSchema = vocabEnumFromEntries(ARMOR_MATERIAL_ENTRIES)

/** Returns the reference entry for an armor material, if known. */
export function getArmorMaterialEntry(m: string): GameTermEntry | undefined {
  return ARMOR_MATERIAL_ENTRIES[m as ArmorMaterial]
}

/** Returns the display label for an armor material. Falls back to the raw value. */
export function getArmorMaterialLabel(m: string): string {
  return getArmorMaterialEntry(m)?.label ?? m
}
