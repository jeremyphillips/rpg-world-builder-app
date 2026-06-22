import { describe, expect, it } from 'vitest'

import { distanceSchema } from '../../primitives/units'
import {
  SPELL_RANGE_KIND_ENTRIES,
  SPELL_RANGE_KINDS,
  getSpellRangeKindLabel,
  spellRangeKindSchema,
  spellRangeSchema,
} from './range'

describe('spellRangeKindSchema', () => {
  it('accepts every known range kind', () => {
    for (const kind of SPELL_RANGE_KINDS) {
      expect(spellRangeKindSchema.parse(kind)).toBe(kind)
    }
  })

  it('rejects unknown range kinds', () => {
    expect(spellRangeKindSchema.safeParse('planetary').success).toBe(false)
  })
})

describe('spellRangeSchema', () => {
  it('distance branch stays aligned with distanceSchema', () => {
    const validDistances = [
      { value: 0, unit: 'ft' },
      { value: 120, unit: 'ft' },
      { value: 0.5, unit: 'ft' },
    ] as const

    for (const distance of validDistances) {
      expect(distanceSchema.safeParse(distance).success).toBe(true)
      expect(spellRangeSchema.safeParse({ kind: 'distance', value: distance }).success).toBe(true)
    }

    const invalidDistances = [
      { value: -1, unit: 'ft' },
      { value: 10, unit: 'm' },
      { value: 10, unit: 'lb' },
    ] as const

    for (const distance of invalidDistances) {
      const distanceResult = distanceSchema.safeParse(distance).success
      const rangeResult = spellRangeSchema.safeParse({ kind: 'distance', value: distance }).success
      expect(rangeResult).toBe(distanceResult)
    }
  })

  it('accepts non-distance kinds without a value', () => {
    expect(spellRangeSchema.parse({ kind: 'self' })).toEqual({ kind: 'self' })
    expect(spellRangeSchema.parse({ kind: 'touch' })).toEqual({ kind: 'touch' })
    expect(spellRangeSchema.parse({ kind: 'special', description: 'See spell text.' })).toEqual({
      kind: 'special',
      description: 'See spell text.',
    })
  })
})

describe('spell range vocabulary', () => {
  it('has a label and description for every range kind', () => {
    for (const kind of SPELL_RANGE_KINDS) {
      const entry = SPELL_RANGE_KIND_ENTRIES[kind]
      expect(entry.label).toBeTruthy()
      expect(entry.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSpellRangeKindLabel('self')).toBe('Self')
    expect(getSpellRangeKindLabel('custom')).toBe('custom')
  })
})
