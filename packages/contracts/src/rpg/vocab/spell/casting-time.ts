import { z } from 'zod'

import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Casting time units — closed SRD set for spell metadata.
// ---------------------------------------------------------------------------

export const CASTING_TIME_UNIT_TERM = {
  label: 'Casting Time Unit',
  description: 'The time cost to cast a spell.',
  sentence: {
    singular: 'casting time unit',
    plural: 'casting time units',
  },
} as const satisfies GameTermEntry

export const CASTING_TIME_UNIT_ENTRIES = {
  action: { label: 'Action', description: 'Cast using an action on your turn.' },
  'bonus-action': { label: 'Bonus action', description: 'Cast using a bonus action on your turn.' },
  reaction: {
    label: 'Reaction',
    description: 'Cast in response to a trigger, using your reaction.',
  },
  minute: { label: 'Minute', description: 'Casting takes one or more minutes.' },
  hour: { label: 'Hour', description: 'Casting takes one or more hours.' },
} as const satisfies Record<string, GameTermEntry>

export type CastingTimeUnit = keyof typeof CASTING_TIME_UNIT_ENTRIES

export const CASTING_TIME_UNITS = keysFromEntries(CASTING_TIME_UNIT_ENTRIES)

export const castingTimeUnitSchema = vocabEnumFromEntries(CASTING_TIME_UNIT_ENTRIES)

export const spellCastingTimeNormalSchema = z.object({
  value: z.number().int().min(1),
  unit: castingTimeUnitSchema,
  /** Required for reaction casting times (e.g. Hellish Rebuke). */
  trigger: z.string().min(1).optional(),
})

export type SpellCastingTimeNormal = z.infer<typeof spellCastingTimeNormalSchema>

export const spellCastingTimeSchema = z.object({
  normal: spellCastingTimeNormalSchema,
  canBeCastAsRitual: z.boolean(),
})

export type SpellCastingTime = z.infer<typeof spellCastingTimeSchema>

/** Returns the display label for a casting time unit. Falls back to the raw value. */
export function getCastingTimeUnitLabel(unit: string): string {
  return CASTING_TIME_UNIT_ENTRIES[unit as CastingTimeUnit]?.label ?? unit
}
