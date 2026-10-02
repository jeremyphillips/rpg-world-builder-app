import { z } from 'zod'

import { formatOrdinal } from '../../primitives/prose'

// ---------------------------------------------------------------------------
// Spell level — closed 1–9 range for slot columns and spell metadata.
// Cantrips are level 0 in rules text but are not part of this vocabulary.
// ---------------------------------------------------------------------------

export const MIN_SPELL_LEVEL = 1
export const MAX_SPELL_LEVEL = 9

export const SPELL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export type SpellLevel = (typeof SPELL_LEVELS)[number]

export const spellLevelSchema = z.number().int().min(MIN_SPELL_LEVEL).max(MAX_SPELL_LEVEL)

/** Returns the ordinal label for a spell level (1 → "1st", 2 → "2nd", …). */
export function formatSpellLevel(level: number): string {
  return formatOrdinal(level)
}
