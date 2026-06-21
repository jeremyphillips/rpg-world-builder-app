import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Schools of magic — closed SRD 5.2.1 set for spell metadata.
// ---------------------------------------------------------------------------

export const SPELL_SCHOOL_ENTRIES = {
  abjuration: {
    label: 'Abjuration',
    description:
      'Abjuration spells protect, block, or banish. They create barriers, negate harmful effects, or harm trespassers.',
  },
  conjuration: {
    label: 'Conjuration',
    description:
      'Conjuration spells transport objects and creatures, create objects, or bring forth creatures from elsewhere.',
  },
  divination: {
    label: 'Divination',
    description:
      'Divination spells reveal information, whether hidden, distant, or in the past or future.',
  },
  enchantment: {
    label: 'Enchantment',
    description:
      'Enchantment spells affect the minds of others, influencing or controlling their behavior.',
  },
  evocation: {
    label: 'Evocation',
    description:
      'Evocation spells manipulate energy to produce a desired effect, often destructive.',
  },
  illusion: {
    label: 'Illusion',
    description:
      'Illusion spells deceive the senses or minds of others, creating false images, sounds, or sensations.',
  },
  necromancy: {
    label: 'Necromancy',
    description:
      'Necromancy spells manipulate life energy, often to drain it, restore it, or create undead.',
  },
  transmutation: {
    label: 'Transmutation',
    description:
      'Transmutation spells change the properties of a creature, object, or environment.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellSchool = keyof typeof SPELL_SCHOOL_ENTRIES

export const SPELL_SCHOOLS = Object.keys(SPELL_SCHOOL_ENTRIES) as [SpellSchool, ...SpellSchool[]]

export const spellSchoolSchema = z.enum(SPELL_SCHOOLS)

/** Returns the reference entry for a spell school id, if known. */
export function getSpellSchoolEntry(id: string): GameTermEntry | undefined {
  return SPELL_SCHOOL_ENTRIES[id as SpellSchool]
}

/** Returns the display label for a spell school. Falls back to the raw value. */
export function getSpellSchoolLabel(id: string): string {
  return getSpellSchoolEntry(id)?.label ?? id
}
