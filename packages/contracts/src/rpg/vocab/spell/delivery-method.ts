import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import { getTermCompactLabel } from '../types'
import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Spell delivery methods — display metadata for attack-roll cantrips/spells.
// ---------------------------------------------------------------------------

export const SPELL_DELIVERY_METHOD_ENTRIES = {
  'melee-spell-attack': {
    label: 'Melee spell attack',
    compactLabel: 'Melee attack',
    description: 'Resolved with a melee spell attack roll against a target within reach.',
  },
  'ranged-spell-attack': {
    label: 'Ranged spell attack',
    compactLabel: 'Ranged attack',
    description: 'Resolved with a ranged spell attack roll against a target within range.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellDeliveryMethod = keyof typeof SPELL_DELIVERY_METHOD_ENTRIES

export const SPELL_DELIVERY_METHODS = keysFromEntries(SPELL_DELIVERY_METHOD_ENTRIES)

export const spellDeliveryMethodSchema = vocabEnumFromEntries(SPELL_DELIVERY_METHOD_ENTRIES)

/** Returns the display label for a spell delivery method. Falls back to the raw value. */
export function getSpellDeliveryMethodLabel(id: string): string {
  return SPELL_DELIVERY_METHOD_ENTRIES[id as SpellDeliveryMethod]?.label ?? id
}

/** Returns the compact picker label for a spell delivery method. Falls back to the raw value. */
export function getCompactSpellDeliveryMethodLabel(id: string): string {
  const entry = SPELL_DELIVERY_METHOD_ENTRIES[id as SpellDeliveryMethod]
  return entry ? getTermCompactLabel(entry) : id
}
