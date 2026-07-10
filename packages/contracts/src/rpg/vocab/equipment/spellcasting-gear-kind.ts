import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Spellcasting gear sub-kinds — discriminates items within
// `kind: adventuring_gear` + `gearKind: spellcasting`.
// ---------------------------------------------------------------------------

export const SPELLCASTING_FOCUS_GEAR_KINDS = [
  'arcane_focus',
  'druidic_focus',
  'holy_symbol',
] as const

export const SPELLCASTING_GEAR_KINDS = [...SPELLCASTING_FOCUS_GEAR_KINDS, 'spellbook'] as const

export const spellcastingFocusGearKindSchema = z.enum(SPELLCASTING_FOCUS_GEAR_KINDS)

export const spellcastingGearKindSchema = z.enum(SPELLCASTING_GEAR_KINDS)

export type SpellcastingFocusGearKind = z.infer<typeof spellcastingFocusGearKindSchema>

export type SpellcastingGearKind = z.infer<typeof spellcastingGearKindSchema>

export const SPELLCASTING_GEAR_KIND_ENTRIES = {
  arcane_focus: {
    label: 'Arcane Focus',
    description: 'An arcane spellcasting focus such as a crystal, orb, rod, staff, or wand.',
    sentence: {
      plural: 'arcane focuses',
    },
  },
  druidic_focus: {
    label: 'Druidic Focus',
    description: 'A druidic spellcasting focus such as mistletoe, a totem, or a wooden staff.',
    sentence: {
      plural: 'druidic focuses',
    },
  },
  holy_symbol: {
    label: 'Holy Symbol',
    description: 'A divine spellcasting focus such as an amulet, emblem, or reliquary.',
  },
  spellbook: {
    label: 'Spellbook',
    description: 'A personal tome used to record and prepare spells, such as a Wizard spellbook.',
  },
} as const satisfies Record<SpellcastingGearKind, GameTermEntry>

/** Returns the reference entry for a spellcasting gear kind, if known. */
export function getSpellcastingGearKindEntry(kind: string): GameTermEntry | undefined {
  return SPELLCASTING_GEAR_KIND_ENTRIES[kind as SpellcastingGearKind]
}

/** Returns the display label for a spellcasting gear kind. Falls back to the raw value. */
export function getSpellcastingGearKindLabel(kind: string): string {
  return getSpellcastingGearKindEntry(kind)?.label ?? kind
}

export function isSpellcastingGearKind(kind: string): kind is SpellcastingGearKind {
  return (SPELLCASTING_GEAR_KINDS as readonly string[]).includes(kind)
}

export function isSpellcastingFocusGearKind(kind: string): kind is SpellcastingFocusGearKind {
  return (SPELLCASTING_FOCUS_GEAR_KINDS as readonly string[]).includes(kind)
}
