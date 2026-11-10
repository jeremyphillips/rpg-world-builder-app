import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import type { CountableTermEntry, VocabularyTerm } from './types'

/**
 * Time units shared by spell duration, casting time, and creature traits.
 * Domain maps pick a subset. They do not redefine these entries.
 */
export const TIME_UNIT_TERM = {
  label: 'Time Unit',
  description: 'A unit of time used in rules text.',
  sentence: {
    singular: 'time unit',
    plural: 'time units',
  },
} as const satisfies VocabularyTerm

export const TIME_UNIT_ENTRIES = {
  round: {
    label: 'Round',
    description: 'One round of combat.',
    sentence: { singular: 'round', plural: 'rounds' },
  },
  minute: {
    label: 'Minute',
    description: 'Sixty seconds.',
    sentence: { singular: 'minute', plural: 'minutes' },
  },
  hour: {
    label: 'Hour',
    description: 'Sixty minutes.',
    sentence: { singular: 'hour', plural: 'hours' },
  },
  day: {
    label: 'Day',
    description: 'Twenty-four hours.',
    sentence: { singular: 'day', plural: 'days' },
  },
} as const satisfies Record<string, CountableTermEntry>

export type TimeUnit = keyof typeof TIME_UNIT_ENTRIES

export const TIME_UNIT_IDS = keysFromEntries(TIME_UNIT_ENTRIES)

export const timeUnitSchema = vocabEnumFromEntries(TIME_UNIT_ENTRIES)

/** Returns the display label for a time unit. Falls back to the raw value. */
export function getTimeUnitLabel(unit: string): string {
  return TIME_UNIT_ENTRIES[unit as TimeUnit]?.label ?? unit
}
