import { describe, expect, it } from 'vitest'

import { generateNames, recommendConventions } from '@rpg/name-generator-core'

import { clearNameCollectionCache, loadNameCollection } from './collections/load-name-collection'
import { CONVENTIONS } from './conventions/manifest'
import { getConvention } from './loader/list-conventions'

async function loadConventionCollections(conventionId: string) {
  const convention = getConvention(conventionId)
  if (convention === undefined) {
    throw new Error(`Missing convention ${conventionId}`)
  }

  const collections = new Map<string, Awaited<ReturnType<typeof loadNameCollection>>>()
  for (const collectionId of convention.collectionIds) {
    collections.set(collectionId, await loadNameCollection(collectionId))
  }
  return { convention, collections }
}

describe('name generator integration', () => {
  it('ranks elvish conventions above unrelated cultures for elvish context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['elvish'],
        cultureIds: ['high-elven'],
      },
      CONVENTIONS,
    )

    const elvish = recommendations.find((item) => item.conventionId === 'elvish-personal')
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(elvish).toBeDefined()
    expect(elvish?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('elvish-personal')
  })

  it.each([
    'elvish-personal',
    'elvish-settlement',
    'draconic-dragon-personal',
    'draconic-dragonborn-clan',
    'dwarven-settlement',
    'faction-general',
    'akan-personal',
  ] as const)('generates deterministic names for %s', async (conventionId) => {
    clearNameCollectionCache()
    const { convention, collections } = await loadConventionCollections(conventionId)

    const request = { conventionId, count: 2, seed: `integration-${conventionId}` }
    const first = generateNames(convention, collections, request)
    const second = generateNames(convention, collections, request)

    expect(first).toEqual(second)
    expect(first).toHaveLength(2)
    expect(new Set(first.map((item) => item.value)).size).toBe(2)
  })
})
