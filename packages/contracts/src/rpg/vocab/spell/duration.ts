import { z } from 'zod'

import type { VocabularyTerm } from '../types'
import { TIME_UNIT_ENTRIES, timeUnitSchema, TIME_UNIT_IDS, type TimeUnit } from '../time-unit'

// ---------------------------------------------------------------------------
// Duration units — spell durations use the shared time-unit entries.
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
  round: TIME_UNIT_ENTRIES.round,
  minute: TIME_UNIT_ENTRIES.minute,
  hour: TIME_UNIT_ENTRIES.hour,
  day: TIME_UNIT_ENTRIES.day,
} as const

export type DurationUnit = TimeUnit

export const DURATION_UNITS = TIME_UNIT_IDS

export const durationUnitSchema = timeUnitSchema

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
