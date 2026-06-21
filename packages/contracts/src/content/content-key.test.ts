import { describe, expect, it } from 'vitest'

import {
  assertStableContentIds,
  assignStableContentIds,
  ContentKeyError,
  deriveContentKey,
  slugifyName,
} from './content-key'

describe('slugifyName', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugifyName('Barbarian')).toBe('barbarian')
    expect(slugifyName('Sleight of Hand')).toBe('sleight-of-hand')
    expect(slugifyName('  Battle  Rage  ')).toBe('battle-rage')
  })

  it('strips diacritics', () => {
    expect(slugifyName('José')).toBe('jose')
    expect(slugifyName('Naïve Feature')).toBe('naive-feature')
  })

  it('returns an empty string when no slug characters remain', () => {
    expect(slugifyName('!!!')).toBe('')
  })
})

describe('deriveContentKey', () => {
  it('returns slugSchema-valid keys', () => {
    expect(deriveContentKey('Fighter')).toBe('fighter')
    expect(deriveContentKey('Words of Creation')).toBe('words-of-creation')
  })

  it('falls back to untitled when the name has no slug characters', () => {
    expect(deriveContentKey('!!!')).toBe('untitled')
  })
})

describe('assignStableContentIds', () => {
  const existing = [{ id: 'rage' }, { id: 'unarmored-defense' }]

  it('preserves ids for existing rows even when the name changes', () => {
    const rows = [
      { id: 'rage', name: 'Battle Rage' },
      { id: 'unarmored-defense', name: 'Unarmored Defense' },
    ]

    expect(assignStableContentIds(rows, existing)).toEqual([
      { id: 'rage', name: 'Battle Rage' },
      { id: 'unarmored-defense', name: 'Unarmored Defense' },
    ])
  })

  it('derives ids for new rows from name', () => {
    const rows = [{ id: 'rage', name: 'Rage' }, { name: 'Reckless Attack' }]

    expect(assignStableContentIds(rows, existing)).toEqual([
      { id: 'rage', name: 'Rage' },
      { id: 'reckless-attack', name: 'Reckless Attack' },
    ])
  })

  it('dedupes sibling ids when names collide', () => {
    const rows = [{ name: 'Darkvision' }, { name: 'Darkvision' }]

    expect(assignStableContentIds(rows)).toEqual([
      { id: 'darkvision', name: 'Darkvision' },
      { id: 'darkvision-2', name: 'Darkvision' },
    ])
  })

  it('ignores client-provided ids that do not match existing', () => {
    const rows = [{ id: 'battle-rage', name: 'Reckless Attack' }]

    expect(assignStableContentIds(rows, existing)).toEqual([
      { id: 'reckless-attack', name: 'Reckless Attack' },
    ])
  })
})

describe('assertStableContentIds', () => {
  const existing = [
    { id: 'rage', name: 'Rage' },
    { id: 'unarmored-defense', name: 'Unarmored Defense' },
  ]

  it('allows unchanged ids and renamed display names', () => {
    expect(() =>
      assertStableContentIds(existing, [{ id: 'rage', name: 'Battle Rage' }]),
    ).not.toThrow()
  })

  it('allows deleting existing rows', () => {
    expect(() => assertStableContentIds(existing, [{ id: 'rage', name: 'Rage' }])).not.toThrow()
  })

  it('allows genuinely new rows', () => {
    expect(() =>
      assertStableContentIds(existing, [
        ...existing,
        { id: 'reckless-attack', name: 'Reckless Attack' },
      ]),
    ).not.toThrow()
  })

  it('rejects rename-in-place (same name, different id)', () => {
    expect(() => assertStableContentIds(existing, [{ id: 'battle-rage', name: 'Rage' }])).toThrow(
      ContentKeyError,
    )
  })

  it('no-ops on empty incoming or existing arrays', () => {
    expect(() => assertStableContentIds([], [{ id: 'rage', name: 'Rage' }])).not.toThrow()
    expect(() => assertStableContentIds(existing, [])).not.toThrow()
    expect(() => assertStableContentIds(existing, undefined)).not.toThrow()
  })
})
