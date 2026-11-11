import { describe, expect, it } from 'vitest'

import type { Spell } from '@rpg/contracts'

import {
  castAtLevelUpcastLabel,
  higherCastLevelOptions,
  limitedUseFromSpellFrequency,
  readSpellFrequency,
  replaceMonsterSpellRow,
  spellAllowsHigherCastLevel,
  spellEntryCatalogMetadata,
  spellEntryFrequencyLabel,
  spellEntryFrequencyMetadata,
  spellFrequencyControlIsShared,
} from './monster-spell-frequency'

const longRest = (value: number) => ({
  kind: 'uses' as const,
  count: { kind: 'fixed' as const, value },
  recovery: { minimumRest: 'long' as const },
})

const detectThoughts = {
  name: 'Detect Thoughts',
  level: 2,
  school: 'divination',
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'self' },
  duration: { kind: 'timed', value: 1, unit: 'minute', concentration: true },
} as Spell

describe('spell entry frequency', () => {
  it('treats an absent limit as At will and writes nothing until a day count is chosen', () => {
    expect(readSpellFrequency(undefined)).toEqual({ status: 'at-will' })
    expect(limitedUseFromSpellFrequency('at-will')).toBeUndefined()
    expect(spellEntryFrequencyLabel(undefined, undefined)).toBe('At will')
  })

  it('round-trips 3/Day through At will to 1/Day without leftover limit keys', () => {
    const three = limitedUseFromSpellFrequency('3')
    expect(readSpellFrequency(three)).toEqual({ status: 'daily', count: 3 })
    expect(limitedUseFromSpellFrequency('at-will')).toBeUndefined()
    expect(limitedUseFromSpellFrequency('1')).toEqual(longRest(1))
    expect(limitedUseFromSpellFrequency('1')).not.toHaveProperty('minRoll')
  })

  it('keeps recharge, short rest, proficiency bonus, and counts above five out of At will', () => {
    const cases = [
      {
        kind: 'recharge' as const,
        minRoll: 5,
      },
      {
        kind: 'uses' as const,
        count: { kind: 'fixed' as const, value: 2 },
        recovery: { minimumRest: 'short' as const },
      },
      {
        kind: 'uses' as const,
        count: { kind: 'proficiency-bonus' as const },
        recovery: { minimumRest: 'long' as const },
      },
      longRest(6),
    ]
    for (const stored of cases) {
      const reading = readSpellFrequency(stored)
      expect(reading.status).toBe('unsupported')
      expect(spellEntryFrequencyLabel(stored, undefined)).not.toBe('At will')
      expect(limitedUseFromSpellFrequency('custom')).toBe('unchanged')
    }
    expect(limitedUseFromSpellFrequency('2')).toEqual(longRest(2))
  })

  it('does not treat an incomplete limit as At will', () => {
    expect(readSpellFrequency({ kind: 'uses' })).toEqual({ status: 'incomplete' })
    expect(readSpellFrequency({ kind: 'recharge' })).toEqual({ status: 'incomplete' })
    expect(spellEntryFrequencyLabel({ kind: 'uses' }, undefined)).toBeUndefined()
  })

  it('shows a shared pool instead of At will and leaves both limits addressable', () => {
    expect(spellEntryFrequencyLabel(undefined, longRest(3))).toBe('3/Day shared')
    expect(spellFrequencyControlIsShared(undefined, longRest(3))).toBe(true)
    expect(spellEntryFrequencyLabel(longRest(1), longRest(3))).toBe('1/Day')
    expect(spellFrequencyControlIsShared(longRest(1), longRest(3))).toBe(false)
  })
})

describe('spell entry cast level', () => {
  it('offers a higher level only for spells from 1st through 8th', () => {
    expect(spellAllowsHigherCastLevel(0)).toBe(false)
    expect(spellAllowsHigherCastLevel(9)).toBe(false)
    expect(spellAllowsHigherCastLevel(undefined)).toBe(false)
    expect(spellAllowsHigherCastLevel(3)).toBe(true)
    expect(higherCastLevelOptions(3).map((option) => option.value)).toEqual([
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
    ])
  })

  it('defaults to the spell level and only labels a real upcast', () => {
    expect(castAtLevelUpcastLabel(undefined, 3)).toBeUndefined()
    expect(castAtLevelUpcastLabel(3, 3)).toBeUndefined()
    expect(castAtLevelUpcastLabel(4, 3)).toBe('Cast at 4th level')
  })
})

describe('spell entry card metadata', () => {
  it('uses the catalog classification and casting time, then frequency', () => {
    expect(spellEntryCatalogMetadata(detectThoughts)).toEqual(['2nd-level Divination', 'Action'])
    expect(spellEntryFrequencyMetadata(longRest(1), undefined, 4, 2)).toEqual([
      '1/Day',
      'Cast at 4th level',
    ])
    expect(spellEntryFrequencyMetadata(undefined, longRest(3), 2, 2)).toEqual(['3/Day shared'])
  })
})

describe('replaceMonsterSpellRow', () => {
  it('keeps the row and its frequency while clearing the cast level', () => {
    expect(
      replaceMonsterSpellRow(
        { spellId: 'fireball', castAtLevel: 4, limitedUse: longRest(2) },
        'lightning-bolt',
      ),
    ).toEqual({ spellId: 'lightning-bolt', limitedUse: longRest(2) })
  })
})
