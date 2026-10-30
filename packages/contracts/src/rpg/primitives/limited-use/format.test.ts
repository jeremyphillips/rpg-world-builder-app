import { describe, expect, expectTypeOf, it } from 'vitest'

import { REST_KIND_ENTRIES, REST_KINDS, type RestKind } from '../../vocab/rest'
import { SPELL_MUTATION_TRIGGER_ENTRIES } from '../../vocab/spell/spell-mutation-policy'
import { restMeetsRecovery } from '../rest-recovery'
import {
  LIMITED_USE_NOTATION,
  LIMITED_USE_NOTATION_STYLES,
  RECHARGE_DIE_FACES,
  formatLimitedUseNotation,
  formatLimitedUseSentence,
  limitedUseDraftSchema,
  limitedUseSchema,
  type LimitedUseNotationStyle,
  type UseCountKind,
} from './index'

const COUNT_CASES = [
  { key: 'fixed-1', count: { kind: 'fixed' as const, value: 1 } },
  { key: 'fixed-3', count: { kind: 'fixed' as const, value: 3 } },
  { key: 'proficiency-bonus', count: { kind: 'proficiency-bonus' as const } },
] as const

const NOTATION_EXPECTATIONS: Record<
  string,
  Record<RestKind, Record<LimitedUseNotationStyle, string>>
> = {
  'fixed-1': {
    short: {
      'stat-block': 'Recharges after a Short or Long Rest',
      feature: '1/Short Rest',
    },
    long: {
      'stat-block': '1/Day',
      feature: '1/Long Rest',
    },
  },
  'fixed-3': {
    short: {
      'stat-block': '3/Short Rest',
      feature: '3/Short Rest',
    },
    long: {
      'stat-block': '3/Day',
      feature: '3/Long Rest',
    },
  },
  'proficiency-bonus': {
    short: {
      'stat-block': 'Proficiency Bonus/Short Rest',
      feature: 'Proficiency Bonus/Short Rest',
    },
    long: {
      'stat-block': 'Proficiency Bonus/Long Rest',
      feature: 'Proficiency Bonus/Long Rest',
    },
  },
}

const SENTENCE_EXPECTATIONS: Record<string, Record<RestKind, string>> = {
  'fixed-1': {
    short: 'once per short or long rest',
    long: 'once per long rest',
  },
  'fixed-3': {
    short: '3 times per short or long rest',
    long: '3 times per long rest',
  },
  'proficiency-bonus': {
    short: 'proficiency bonus times per short or long rest',
    long: 'proficiency bonus times per long rest',
  },
}

describe('restMeetsRecovery', () => {
  it('treats long rest as meeting both thresholds and short rest as meeting only short', () => {
    expect(restMeetsRecovery('short', { minimumRest: 'short' })).toBe(true)
    expect(restMeetsRecovery('long', { minimumRest: 'short' })).toBe(true)
    expect(restMeetsRecovery('long', { minimumRest: 'long' })).toBe(true)
    expect(restMeetsRecovery('short', { minimumRest: 'long' })).toBe(false)
  })

  it('uses the long-rest vocabulary label for the spell mutation trigger', () => {
    expect(SPELL_MUTATION_TRIGGER_ENTRIES.longRest.label).toBe(REST_KIND_ENTRIES.long.label)
    expect(REST_KINDS).toEqual(['short', 'long'])
  })
})

describe('limitedUseSchema', () => {
  it('accepts recharge thresholds 2 through 6 and rejects 1, 7, and fractions', () => {
    for (let minRoll = 2; minRoll <= RECHARGE_DIE_FACES; minRoll += 1) {
      expect(limitedUseSchema.safeParse({ kind: 'recharge', minRoll }).success).toBe(true)
    }
    expect(limitedUseSchema.safeParse({ kind: 'recharge', minRoll: 1 }).success).toBe(false)
    expect(limitedUseSchema.safeParse({ kind: 'recharge', minRoll: 7 }).success).toBe(false)
    expect(limitedUseSchema.safeParse({ kind: 'recharge', minRoll: 2.5 }).success).toBe(false)
  })

  it('accepts every published value in the draft schema', () => {
    const published = {
      kind: 'uses' as const,
      count: { kind: 'fixed' as const, value: 2 },
      recovery: { minimumRest: 'long' as const },
    }
    expect(limitedUseDraftSchema.parse(published)).toEqual(published)
    expect(limitedUseDraftSchema.parse({ kind: 'uses' })).toEqual({ kind: 'uses' })
    expect(limitedUseDraftSchema.parse({ kind: 'recharge' })).toEqual({ kind: 'recharge' })
  })
})

describe('limited use notation', () => {
  it('formats every count, rest, and style from the exhaustive table', () => {
    for (const countCase of COUNT_CASES) {
      for (const rest of REST_KINDS) {
        for (const style of LIMITED_USE_NOTATION_STYLES) {
          expect(
            formatLimitedUseNotation(
              {
                kind: 'uses',
                count: countCase.count,
                recovery: { minimumRest: rest },
              },
              style,
            ),
          ).toBe(NOTATION_EXPECTATIONS[countCase.key]?.[rest][style])
        }
      }
    }

    for (let minRoll = 2; minRoll <= 5; minRoll += 1) {
      for (const style of LIMITED_USE_NOTATION_STYLES) {
        expect(formatLimitedUseNotation({ kind: 'recharge', minRoll }, style)).toBe(
          `Recharge ${minRoll}–6`,
        )
      }
    }
    for (const style of LIMITED_USE_NOTATION_STYLES) {
      expect(formatLimitedUseNotation({ kind: 'recharge', minRoll: 6 }, style)).toBe('Recharge 6')
    }
  })

  it('keeps the notation table complete for every count kind, rest, and style', () => {
    expectTypeOf(LIMITED_USE_NOTATION).toMatchTypeOf<
      Record<
        UseCountKind,
        Record<RestKind, Record<LimitedUseNotationStyle, (count: number) => string>>
      >
    >()
  })
})

describe('formatLimitedUseSentence', () => {
  it('formats an absent limit and every uses combination, including the legacy frequencies', () => {
    expect(formatLimitedUseSentence()).toBe('at will')
    for (const countCase of COUNT_CASES) {
      for (const rest of REST_KINDS) {
        expect(
          formatLimitedUseSentence({
            kind: 'uses',
            count: countCase.count,
            recovery: { minimumRest: rest },
          }),
        ).toBe(SENTENCE_EXPECTATIONS[countCase.key]?.[rest])
      }
    }
  })
})
