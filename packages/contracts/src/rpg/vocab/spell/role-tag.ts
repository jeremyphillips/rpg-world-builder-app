import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Spell role tags — closed browse/filter vocabulary for spell discovery.
// ---------------------------------------------------------------------------

export const SPELL_ROLE_TAG_TERM = {
  label: 'Spell Role Tag',
  description: "A browse/filter tag describing a spell's primary role in play.",
  sentence: {
    singular: 'spell role tag',
    plural: 'spell role tags',
  },
} as const satisfies GameTermEntry

export const SPELL_ROLE_TAG_ENTRIES = {
  damage: { label: 'Damage', description: 'Primarily deals hit point loss or harm.' },
  buff: { label: 'Buff', description: 'Primarily improves allies or the caster.' },
  debuff: { label: 'Debuff', description: 'Primarily impairs enemies or targets.' },
  control: { label: 'Control', description: 'Primarily restricts movement or actions.' },
  healing: { label: 'Healing', description: 'Primarily restores hit points or vitality.' },
  movement: { label: 'Movement', description: 'Primarily repositions creatures or objects.' },
  warding: { label: 'Warding', description: 'Primarily protects against harm or intrusion.' },
  summoning: {
    label: 'Summoning',
    description: 'Primarily brings creatures or objects into being.',
  },
  detection: {
    label: 'Detection',
    description: 'Primarily reveals hidden information or presence.',
  },
  banishment: { label: 'Banishment', description: 'Primarily removes or sends away targets.' },
} as const satisfies Record<string, GameTermEntry>

export type SpellRoleTag = keyof typeof SPELL_ROLE_TAG_ENTRIES

export const SPELL_ROLE_TAGS = keysFromEntries(SPELL_ROLE_TAG_ENTRIES)

export const spellRoleTagSchema = vocabEnumFromEntries(SPELL_ROLE_TAG_ENTRIES)

/** Returns the display label for a spell role tag. Falls back to the raw value. */
export function getSpellRoleTagLabel(id: string): string {
  return SPELL_ROLE_TAG_ENTRIES[id as SpellRoleTag]?.label ?? id
}
