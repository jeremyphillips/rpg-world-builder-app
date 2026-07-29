import { describe, expect, it } from 'vitest'

import {
  chainComparators,
  compareNumberAscending,
  compareNumberDescending,
  compareOptionalLast,
  compareStringAscending,
  compareStringDescending,
} from './comparators'

describe('chainComparators', () => {
  it('returns the first non-zero comparison', () => {
    const compare = chainComparators<{ score: number; name: string }>(
      (left, right) => right.score - left.score,
      (left, right) => left.name.localeCompare(right.name),
    )

    expect(compare({ score: 2, name: 'Beta' }, { score: 1, name: 'Alpha' })).toBeLessThan(0)
    expect(compare({ score: 1, name: 'Beta' }, { score: 1, name: 'Alpha' })).toBeGreaterThan(0)
    expect(compare({ score: 1, name: 'Alpha' }, { score: 1, name: 'Alpha' })).toBe(0)
  })
})

describe('compareNumberDescending', () => {
  it('orders larger numbers first', () => {
    expect(compareNumberDescending(1, 2)).toBeGreaterThan(0)
    expect(compareNumberDescending(2, 1)).toBeLessThan(0)
  })
})

describe('compareNumberAscending', () => {
  it('orders smaller numbers first', () => {
    expect(compareNumberAscending(1, 2)).toBeLessThan(0)
    expect(compareNumberAscending(2, 1)).toBeGreaterThan(0)
  })
})

describe('compareStringAscending', () => {
  it('compares strings with locale-aware ordering', () => {
    expect(compareStringAscending('Alpha', 'Beta')).toBeLessThan(0)
    expect(compareStringDescending('Alpha', 'Beta')).toBeGreaterThan(0)
  })
})

describe('compareOptionalLast', () => {
  it('sorts nullish values after defined values', () => {
    expect(compareOptionalLast(undefined, 1, compareNumberAscending)).toBeGreaterThan(0)
    expect(compareOptionalLast(1, undefined, compareNumberAscending)).toBeLessThan(0)
    expect(compareOptionalLast(undefined, undefined, compareNumberAscending)).toBe(0)
  })
})
