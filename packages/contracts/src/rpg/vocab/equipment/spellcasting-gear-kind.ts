import { closedSetEnum, keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Spellcasting gear sub-kinds — discriminates items within
// `kind: adventuring_gear` + `gearKind: spellcasting`.
// ---------------------------------------------------------------------------

export const SPELLCASTING_GEAR_KIND_TERM = {
  label: 'Spellcasting Gear Kind',
  description: 'Arcane or divine spellcasting focus classification.',
  sentence: {
    singular: 'spellcasting gear kind',
    plural: 'spellcasting gear kinds',
  },
} as const satisfies VocabularyTerm

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
  component_pouch: {
    label: 'Component Pouch',
    description: 'A watertight pouch with compartments for the material components of spells.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellcastingGearKind = keyof typeof SPELLCASTING_GEAR_KIND_ENTRIES

export const SPELLCASTING_GEAR_KINDS = keysFromEntries(SPELLCASTING_GEAR_KIND_ENTRIES)

export const SPELLCASTING_FOCUS_GEAR_KINDS = [
  'arcane_focus',
  'druidic_focus',
  'holy_symbol',
] as const satisfies readonly SpellcastingGearKind[]

export type SpellcastingFocusGearKind = (typeof SPELLCASTING_FOCUS_GEAR_KINDS)[number]

export const spellcastingGearKindSchema = vocabEnumFromEntries(SPELLCASTING_GEAR_KIND_ENTRIES)

export const spellcastingFocusGearKindSchema = closedSetEnum(SPELLCASTING_FOCUS_GEAR_KINDS)

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
