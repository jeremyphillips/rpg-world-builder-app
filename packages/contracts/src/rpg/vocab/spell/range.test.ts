import { describe, expect, it } from 'vitest'

import {
  SPELL_RANGE_KIND_ENTRIES,
  SPELL_RANGE_KINDS,
  getSpellRangeKindLabel,
  spellRangeDistanceSchema,
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
  it('accepts positive feet and miles, including values outside the preset lists', () => {
    expect(spellRangeDistanceSchema.parse({ value: 175, unit: 'ft' })).toEqual({
      value: 175,
      unit: 'ft',
    })
    expect(spellRangeSchema.parse({ kind: 'distance', value: { value: 300, unit: 'ft' } })).toEqual(
      {
        kind: 'distance',
        value: { value: 300, unit: 'ft' },
      },
    )
    expect(spellRangeSchema.parse({ kind: 'distance', value: { value: 1, unit: 'mi' } })).toEqual({
      kind: 'distance',
      value: { value: 1, unit: 'mi' },
    })
    expect(spellRangeSchema.parse({ kind: 'distance', value: { value: 500, unit: 'mi' } })).toEqual(
      {
        kind: 'distance',
        value: { value: 500, unit: 'mi' },
      },
    )
  })

  it('rejects zero, negative, and unknown units', () => {
    expect(
      spellRangeSchema.safeParse({ kind: 'distance', value: { value: 0, unit: 'ft' } }).success,
    ).toBe(false)
    expect(
      spellRangeSchema.safeParse({ kind: 'distance', value: { value: -1, unit: 'ft' } }).success,
    ).toBe(false)
    expect(
      spellRangeSchema.safeParse({ kind: 'distance', value: { value: 10, unit: 'm' } }).success,
    ).toBe(false)
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
