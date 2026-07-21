import { z } from 'zod'

import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Duration units — closed SRD set for timed spell durations.
// ---------------------------------------------------------------------------

export const DURATION_UNIT_TERM = {
  label: 'Duration Unit',
  description: "The time scale for a spell's duration.",
  sentence: {
    singular: 'duration unit',
    plural: 'duration units',
  },
} as const satisfies VocabularyTerm

export const DURATION_UNIT_ENTRIES = {
  round: { label: 'Round', description: 'Lasts for one or more rounds of combat.' },
  minute: { label: 'Minute', description: 'Lasts for one or more minutes.' },
  hour: { label: 'Hour', description: 'Lasts for one or more hours.' },
  day: { label: 'Day', description: 'Lasts for one or more days.' },
} as const satisfies Record<string, GameTermEntry>

export type DurationUnit = keyof typeof DURATION_UNIT_ENTRIES

export const DURATION_UNITS = keysFromEntries(DURATION_UNIT_ENTRIES)

export const durationUnitSchema = vocabEnumFromEntries(DURATION_UNIT_ENTRIES)

const spellDurationInstantaneousSchema = z.object({ kind: z.literal('instantaneous') })

const spellDurationTimedSchema = z.object({
  kind: z.literal('timed'),
  value: z.number().int().min(1),
  unit: durationUnitSchema,
  concentration: z.literal(true).optional(),
  upTo: z.literal(true).optional(),
})

const spellDurationSpecialSchema = z.object({
  kind: z.literal('special'),
  description: z.string().min(1),
})

export const spellDurationSchema = z.discriminatedUnion('kind', [
  spellDurationInstantaneousSchema,
  spellDurationTimedSchema,
  spellDurationSpecialSchema,
])

export type SpellDuration = z.infer<typeof spellDurationSchema>

/** Returns the display label for a duration unit. Falls back to the raw value. */
export function getDurationUnitLabel(unit: string): string {
  return DURATION_UNIT_ENTRIES[unit as DurationUnit]?.label ?? unit
}
