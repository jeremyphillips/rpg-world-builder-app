import { describe, expect, it } from 'vitest'

import {
  USAGE_FREQUENCIES,
  USAGE_FREQUENCY_ENTRIES,
  getUsageFrequencyEntry,
  getUsageFrequencyLabel,
  getUsageFrequencySentenceForm,
  usageFrequencySchema,
} from './usage-frequency'

describe('usageFrequencySchema', () => {
  it('accepts every known usage frequency', () => {
    for (const frequency of USAGE_FREQUENCIES) {
      expect(usageFrequencySchema.parse(frequency)).toBe(frequency)
    }
  })

  it('rejects unknown usage frequencies', () => {
    expect(usageFrequencySchema.safeParse('once_per_short_rest').success).toBe(false)
  })
})

describe('usage frequency vocabulary', () => {
  it('derives USAGE_FREQUENCIES from the entry map', () => {
    expect([...USAGE_FREQUENCIES].sort()).toEqual(Object.keys(USAGE_FREQUENCY_ENTRIES).sort())
  })

  it('has a label and description for every usage frequency', () => {
    for (const frequency of USAGE_FREQUENCIES) {
      const entry = getUsageFrequencyEntry(frequency)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getUsageFrequencyLabel('at_will')).toBe('At Will')
    expect(getUsageFrequencyLabel('custom')).toBe('custom')
  })

  it('returns cadence phrases for generated prose', () => {
    expect(getUsageFrequencySentenceForm('at_will')).toBe('at will')
    expect(getUsageFrequencySentenceForm('once_per_long_rest')).toBe('once per long rest')
    expect(getUsageFrequencySentenceForm('prof_bonus_per_long_rest')).toBe(
      'proficiency bonus times per long rest',
    )
  })
})
