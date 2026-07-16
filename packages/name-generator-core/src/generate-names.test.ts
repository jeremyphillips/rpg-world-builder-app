import { describe, expect, it } from 'vitest'

import { NameGeneratorError } from '@rpg/contracts/name-generator'

import { ELVISH_PERSONAL_CONVENTION } from '@rpg/contracts/name-generator/test-fixtures'
import { generateName } from './generate-name'
import { generateNames } from './generate-names'
import { ELVISH_COLLECTIONS } from './recommend-conventions.test'

describe('generateName', () => {
  it('assembles a structured name from bound collections', () => {
    const result = generateName(ELVISH_PERSONAL_CONVENTION, ELVISH_COLLECTIONS, {
      conventionId: 'elvish-personal',
      count: 1,
      seed: 'fixture-seed',
    })

    expect(result.conventionId).toBe('elvish-personal')
    expect(result.parts.given).toBeDefined()
    expect(result.parts.family).toBeDefined()
    expect(result.value).toBe(`${result.parts.given} ${result.parts.family}`)
  })

  it('is deterministic for the same seed', () => {
    const request = { conventionId: 'elvish-personal', count: 1, seed: 'stable-seed' }
    const first = generateName(ELVISH_PERSONAL_CONVENTION, ELVISH_COLLECTIONS, request)
    const second = generateName(ELVISH_PERSONAL_CONVENTION, ELVISH_COLLECTIONS, request)
    expect(second).toEqual(first)
  })

  it('varies output for different seeds', () => {
    const first = generateName(ELVISH_PERSONAL_CONVENTION, ELVISH_COLLECTIONS, {
      conventionId: 'elvish-personal',
      count: 1,
      seed: 'seed-one',
    })
    const second = generateName(ELVISH_PERSONAL_CONVENTION, ELVISH_COLLECTIONS, {
      conventionId: 'elvish-personal',
      count: 1,
      seed: 'seed-two',
    })
    expect(second.value).not.toBe(first.value)
  })

  it('throws when a collection is missing', () => {
    expect(() =>
      generateName(ELVISH_PERSONAL_CONVENTION, new Map(), {
        conventionId: 'elvish-personal',
        count: 1,
      }),
    ).toThrow(NameGeneratorError)
  })
})

describe('generateNames', () => {
  it('returns the requested count without duplicates', () => {
    const results = generateNames(ELVISH_PERSONAL_CONVENTION, ELVISH_COLLECTIONS, {
      conventionId: 'elvish-personal',
      count: 3,
      seed: 'batch-seed',
    })

    expect(results).toHaveLength(3)
    expect(new Set(results.map((item) => item.value)).size).toBe(3)
  })

  it('honors exclude lists', () => {
    const excluded = generateName(ELVISH_PERSONAL_CONVENTION, ELVISH_COLLECTIONS, {
      conventionId: 'elvish-personal',
      count: 1,
      seed: 'exclude-seed',
    })

    const results = generateNames(ELVISH_PERSONAL_CONVENTION, ELVISH_COLLECTIONS, {
      conventionId: 'elvish-personal',
      count: 1,
      seed: 'exclude-seed-2',
      exclude: [excluded.value],
    })

    expect(results[0]?.value).not.toBe(excluded.value)
  })
})
