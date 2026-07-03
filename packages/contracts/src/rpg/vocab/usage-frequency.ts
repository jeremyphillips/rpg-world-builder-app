import { z } from 'zod'

import { getTermSentenceForm } from './types'
import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Usage frequency — how often a limited-use ability can be invoked for free
// (innate spells, racial features, feat-granted abilities, etc.). Spell-agnostic:
// the same cadence applies wherever the SRD uses at-will or per-long-rest limits.
// ---------------------------------------------------------------------------

export const USAGE_FREQUENCY_ENTRIES = {
  at_will: {
    label: 'At Will',
    description: 'You can use this ability at will, without expending a limited use.',
    sentence: {
      singular: 'at will',
      plural: 'at will',
    },
  },
  once_per_long_rest: {
    label: '1/Long Rest',
    description:
      'You can use this ability once, and you regain the ability to do so when you finish a Long Rest.',
    sentence: {
      singular: 'once per long rest',
      plural: 'once per long rest',
    },
  },
  prof_bonus_per_long_rest: {
    label: 'Proficiency Bonus/Long Rest',
    description:
      'You can use this ability a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.',
    sentence: {
      singular: 'proficiency bonus times per long rest',
      plural: 'proficiency bonus times per long rest',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type UsageFrequency = keyof typeof USAGE_FREQUENCY_ENTRIES

export const USAGE_FREQUENCIES = Object.keys(USAGE_FREQUENCY_ENTRIES) as [
  UsageFrequency,
  ...UsageFrequency[],
]

export const usageFrequencySchema = z.enum(USAGE_FREQUENCIES)

/** Returns the reference entry for a usage frequency id, if known. */
export function getUsageFrequencyEntry(id: string): GameTermEntry | undefined {
  return USAGE_FREQUENCY_ENTRIES[id as UsageFrequency]
}

/** Returns the display label for a usage frequency. Falls back to the raw value. */
export function getUsageFrequencyLabel(id: string): string {
  return getUsageFrequencyEntry(id)?.label ?? id
}

/** Cadence phrase for generated spell and ability prose. Count is ignored — cadence is not counted. */
export function getUsageFrequencySentenceForm(id: string): string {
  const entry = getUsageFrequencyEntry(id)
  if (entry) return getTermSentenceForm(entry, 1)
  return getTermSentenceForm({ label: id, description: '' }, 1)
}
