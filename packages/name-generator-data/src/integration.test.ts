import { describe, expect, it } from 'vitest'

import { generateName, generateNames, recommendConventions } from '@rpg/name-generator-core'

import { clearNameCollectionCache, loadNameCollection } from './collections/load-name-collection'
import { buildCultureContextFields } from './lib/resolve-naming-cultures'
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
  it('ranks wood elf heritage culture for wood-elf naming context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['elvish'],
        cultureIds: ['wood-elf'],
        conventionCultureIds: ['elven-general'],
        cultureResolutions: { 'wood-elf': 'elven-general' },
        speciesIds: ['srd-cc-5.2.1:elf'],
      },
      CONVENTIONS,
    )

    const elvish = recommendations.find((item) => item.conventionId === 'elvish-personal')
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(elvish).toBeDefined()
    expect(elvish?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('elvish-personal')
  })

  it('ranks elvish conventions above unrelated cultures for elvish context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['elvish'],
        ...buildCultureContextFields('high-elf'),
      },
      CONVENTIONS,
    )

    const elvish = recommendations.find((item) => item.conventionId === 'elvish-personal')
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(elvish).toBeDefined()
    expect(elvish?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('elvish-personal')
  })

  it('ranks dwarven personal above unrelated cultures for dwarf context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['dwarvish'],
        cultureIds: ['mountain-dwarf'],
        speciesIds: ['srd-cc-5.2.1:dwarf'],
      },
      CONVENTIONS,
    )

    const dwarven = recommendations.find((item) => item.conventionId === 'dwarven-personal')
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(dwarven).toBeDefined()
    expect(dwarven?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('dwarven-personal')
  })

  it('ranks halfling personal above unrelated cultures for halfling context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['halfling'],
        cultureIds: ['common-halfling'],
        speciesIds: ['srd-cc-5.2.1:halfling'],
      },
      CONVENTIONS,
    )

    const halfling = recommendations.find((item) => item.conventionId === 'halfling-personal')
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(halfling).toBeDefined()
    expect(halfling?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('halfling-personal')
  })

  it('ranks dragonborn personal above unrelated cultures for dragonborn context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['draconic'],
        cultureIds: ['draconic-dragonborn'],
        speciesIds: ['srd-cc-5.2.1:dragonborn'],
      },
      CONVENTIONS,
    )

    const dragonborn = recommendations.find(
      (item) => item.conventionId === 'draconic-dragonborn-personal',
    )
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(dragonborn).toBeDefined()
    expect(dragonborn?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('draconic-dragonborn-personal')
  })

  it('ranks tiefling personal above unrelated cultures for tiefling context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        cultureIds: ['infernal-tiefling'],
        speciesIds: ['srd-cc-5.2.1:tiefling'],
      },
      CONVENTIONS,
    )

    const tiefling = recommendations.find(
      (item) => item.conventionId === 'infernal-tiefling-personal',
    )
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(tiefling).toBeDefined()
    expect(tiefling?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('infernal-tiefling-personal')
  })

  it('ranks gnomish personal above unrelated cultures for gnome context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['gnomish'],
        cultureIds: ['common-gnome'],
        speciesIds: ['srd-cc-5.2.1:gnome'],
      },
      CONVENTIONS,
    )

    const gnomish = recommendations.find((item) => item.conventionId === 'gnomish-personal')
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(gnomish).toBeDefined()
    expect(gnomish?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('gnomish-personal')
  })

  it('ranks goliath personal above unrelated cultures for goliath context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['giant'],
        cultureIds: ['giant-goliath'],
        speciesIds: ['srd-cc-5.2.1:goliath'],
      },
      CONVENTIONS,
    )

    const goliath = recommendations.find((item) => item.conventionId === 'goliath-personal')
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(goliath).toBeDefined()
    expect(goliath?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('goliath-personal')
  })

  it('ranks orc personal above unrelated cultures for orc context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['orc'],
        cultureIds: ['common-orc'],
        speciesIds: ['srd-cc-5.2.1:orc'],
      },
      CONVENTIONS,
    )

    const orc = recommendations.find((item) => item.conventionId === 'orc-personal')
    const akan = recommendations.find((item) => item.conventionId === 'akan-personal')

    expect(orc).toBeDefined()
    expect(orc?.score).toBeGreaterThan(akan?.score ?? 0)
    expect(recommendations[0]?.conventionId).toBe('orc-personal')
  })

  it('produces both tiefling personal structure variants across a seeded batch', async () => {
    clearNameCollectionCache()
    const { convention, collections } = await loadConventionCollections(
      'infernal-tiefling-personal',
    )

    const structureIds = new Set(
      Array.from(
        { length: 20 },
        (_, attemptIndex) =>
          generateName(
            convention,
            collections,
            {
              conventionId: 'infernal-tiefling-personal',
              count: 1,
              seed: 'tiefling-structure-variants',
            },
            attemptIndex,
          ).structureId,
      ),
    )

    expect(structureIds).toEqual(new Set(['given-only', 'given-virtue']))
  })

  it.each([
    'elvish-personal',
    'elvish-settlement',
    'draconic-dragon-personal',
    'draconic-dragonborn-personal',
    'draconic-dragonborn-clan',
    'dwarven-personal',
    'dwarven-settlement',
    'halfling-personal',
    'halfling-settlement',
    'infernal-tiefling-personal',
    'gnomish-personal',
    'gnomish-settlement',
    'goliath-personal',
    'orc-personal',
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
