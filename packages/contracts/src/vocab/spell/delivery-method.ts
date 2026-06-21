import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Spell delivery methods — display metadata for attack-roll cantrips/spells.
// ---------------------------------------------------------------------------

export const SPELL_DELIVERY_METHOD_ENTRIES = {
  'melee-spell-attack': {
    label: 'Melee spell attack',
    description: 'Resolved with a melee spell attack roll against a target within reach.',
  },
  'ranged-spell-attack': {
    label: 'Ranged spell attack',
    description: 'Resolved with a ranged spell attack roll against a target within range.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellDeliveryMethod = keyof typeof SPELL_DELIVERY_METHOD_ENTRIES

export const SPELL_DELIVERY_METHODS = Object.keys(SPELL_DELIVERY_METHOD_ENTRIES) as [
  SpellDeliveryMethod,
  ...SpellDeliveryMethod[],
]

export const spellDeliveryMethodSchema = z.enum(SPELL_DELIVERY_METHODS)

/** Returns the display label for a spell delivery method. Falls back to the raw value. */
export function getSpellDeliveryMethodLabel(id: string): string {
  return SPELL_DELIVERY_METHOD_ENTRIES[id as SpellDeliveryMethod]?.label ?? id
}
