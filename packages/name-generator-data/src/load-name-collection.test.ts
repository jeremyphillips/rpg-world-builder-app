import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import { NameGeneratorError } from '@rpg/contracts/name-generator'

import * as importMap from './collections/import-map'
import { clearNameCollectionCache, loadNameCollection } from './collections/load-name-collection'
import { getCachedNameCollection } from './collections/name-collection-cache'

describe('loadNameCollection', () => {
  beforeEach(() => {
    clearNameCollectionCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads and validates a fixture collection', async () => {
    const collection = await loadNameCollection('elvish-given-pool')
    expect(collection.id).toBe('elvish-given-pool')
    expect(collection.generator.type).toBe('sample')
  })

  it('returns cached collections on subsequent loads', async () => {
    const first = await loadNameCollection('elvish-family-pool')
    const cached = getCachedNameCollection('elvish-family-pool')
    const second = await loadNameCollection('elvish-family-pool')

    expect(cached).toBe(first)
    expect(second).toBe(first)
  })

  it('throws for unknown collection ids', async () => {
    await expect(loadNameCollection('unknown-pool')).rejects.toMatchObject({
      code: 'unknown-collection',
    })
  })

  it('throws when a loaded asset fails validation', async () => {
    vi.spyOn(importMap, 'importCollectionModule').mockResolvedValueOnce({
      id: 'elvish-given-pool',
      label: 'Broken',
      subjectKinds: ['person'],
      generator: { type: 'sample', pools: [] },
      provenance: {
        sourceName: 'Broken',
        license: 'original',
        methodology: 'original-fictional',
      },
      version: 1,
    })

    await expect(loadNameCollection('elvish-given-pool')).rejects.toMatchObject({
      code: 'invalid-asset',
    })
  })

  it('throws when asset id does not match manifest id', async () => {
    vi.spyOn(importMap, 'importCollectionModule').mockResolvedValueOnce({
      id: 'wrong-id',
      label: 'Wrong',
      subjectKinds: ['person'],
      generator: {
        type: 'sample',
        pools: [{ id: 'a', role: 'given', values: ['A'] }],
      },
      provenance: {
        sourceName: 'Wrong',
        license: 'original',
        methodology: 'original-fictional',
      },
      version: 1,
    })

    await expect(loadNameCollection('elvish-given-pool')).rejects.toBeInstanceOf(NameGeneratorError)
  })
})
