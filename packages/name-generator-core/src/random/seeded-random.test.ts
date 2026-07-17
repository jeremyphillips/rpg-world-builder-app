import { describe, expect, it } from 'vitest'

import { createMulberry32 } from './seeded-random'
import { createSeededRng, hashSeedString } from './create-seeded-rng'

describe('seeded random', () => {
  it('produces identical sequences for the same seed', () => {
    const left = createSeededRng('alpha', 'beta')
    const right = createSeededRng('alpha', 'beta')

    const leftValues = Array.from({ length: 5 }, () => left.next())
    const rightValues = Array.from({ length: 5 }, () => right.next())

    expect(leftValues).toEqual(rightValues)
  })

  it('produces different sequences for different seeds', () => {
    const left = createSeededRng('seed-a')
    const right = createSeededRng('seed-b')

    expect(left.next()).not.toBe(right.next())
  })

  it('hashSeedString is stable', () => {
    expect(hashSeedString('test')).toBe(hashSeedString('test'))
    expect(hashSeedString('a')).not.toBe(hashSeedString('b'))
  })

  it('nextInt stays within bounds', () => {
    const rng = createMulberry32(42)
    for (let index = 0; index < 100; index += 1) {
      const value = rng.nextInt(5)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(5)
    }
  })
})
