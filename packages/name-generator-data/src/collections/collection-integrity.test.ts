import { beforeAll, describe, expect, it } from 'vitest'

import type { NameCollection } from '@rpg/contracts/name-generator'

import { loadNameCollection } from './load-name-collection'
import { COLLECTION_MANIFEST_ENTRIES } from './manifest'

/** `approximateResultCount` is a manifest estimate, not an exact count. */
const COUNT_TOLERANCE = 0.1

const collections = new Map<string, NameCollection>()

function getPools(collection: NameCollection) {
  return collection.generator.type === 'sample' ? collection.generator.pools : []
}

function countValues(collection: NameCollection): number {
  return getPools(collection).reduce((total, pool) => total + pool.values.length, 0)
}

beforeAll(async () => {
  for (const entry of COLLECTION_MANIFEST_ENTRIES) {
    collections.set(entry.id, await loadNameCollection(entry.id))
  }
})

describe.each(COLLECTION_MANIFEST_ENTRIES)('$id', (entry) => {
  function collection(): NameCollection {
    const loaded = collections.get(entry.id)
    if (loaded === undefined) {
      throw new Error(`Collection "${entry.id}" was not loaded`)
    }
    return loaded
  }

  it('matches the manifest label and subject kinds', () => {
    expect(collection().label).toBe(entry.label)
    expect(collection().subjectKinds).toEqual([...entry.subjectKinds])
  })

  it('holds unique, alphabetically sorted values in every pool', () => {
    for (const pool of getPools(collection())) {
      expect(new Set(pool.values).size, `duplicate values in pool "${pool.id}"`).toBe(
        pool.values.length,
      )
      expect([...pool.values].sort((left, right) => left.localeCompare(right))).toEqual([
        ...pool.values,
      ])
    }
  })

  it('holds a value count within tolerance of the manifest estimate', () => {
    const expected = entry.approximateResultCount
    const allowed = Math.max(1, Math.ceil(expected * COUNT_TOLERANCE))

    expect(Math.abs(countValues(collection()) - expected)).toBeLessThanOrEqual(allowed)
  })
})
