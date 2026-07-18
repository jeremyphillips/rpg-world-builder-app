import { describe, expect, it } from 'vitest'

import type { NamingConvention } from '@rpg/contracts/name-generator'
import { generateName, generateNames, recommendConventions } from '@rpg/name-generator-core'
import {
  clearNameCollectionCache,
  CULTURE_CONVENTION_BINDINGS,
  HERITAGE_CULTURE_ALIASES,
  listStaticConventions,
  loadNameCollection,
  STANDALONE_NAMING_CULTURES,
} from '@rpg/name-generator-data'

import {
  resolveCampaignConventions,
  type SpeciesCultureInput,
} from './resolve-campaign-conventions'
import { resolveStandaloneConventions } from './resolve-standalone-conventions'

const CAMPAIGN_SPECIES: SpeciesCultureInput[] = [
  {
    id: 'srd-cc-5.2.1:dwarf',
    slug: 'dwarf',
    name: 'Dwarf',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['clan'] } },
    languageAffinities: ['dwarvish'],
  },
  {
    id: 'srd-cc-5.2.1:elf',
    slug: 'elf',
    name: 'Elf',
    source: 'system',
    culture: {
      id: 'elven',
      name: 'Elven',
      naming: { supported: true, personalNameComponents: ['family'] },
    },
    languageAffinities: ['elvish'],
  },
  {
    id: 'srd-cc-5.2.1:halfling',
    slug: 'halfling',
    name: 'Halfling',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['family'] } },
    languageAffinities: ['halfling'],
  },
  {
    id: 'srd-cc-5.2.1:dragonborn',
    slug: 'dragonborn',
    name: 'Dragonborn',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['clan'] } },
    languageAffinities: ['draconic'],
  },
  {
    id: 'srd-cc-5.2.1:gnome',
    slug: 'gnome',
    name: 'Gnome',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['family'] } },
    languageAffinities: ['gnomish'],
  },
  {
    id: 'srd-cc-5.2.1:goliath',
    slug: 'goliath',
    name: 'Goliath',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['epithet', 'clan'] } },
    languageAffinities: ['giant'],
  },
  {
    id: 'srd-cc-5.2.1:orc',
    slug: 'orc',
    name: 'Orc',
    source: 'system',
    culture: { naming: { supported: true } },
    languageAffinities: ['orc'],
  },
  {
    id: 'srd-cc-5.2.1:tiefling',
    slug: 'tiefling',
    name: 'Tiefling',
    source: 'system',
    culture: { naming: { supported: true, personalNameComponents: ['virtue'] } },
  },
]

function composeIntegrationConventions(): NamingConvention[] {
  return [
    ...resolveCampaignConventions({
      species: CAMPAIGN_SPECIES,
      bindings: CULTURE_CONVENTION_BINDINGS,
      heritageAliases: HERITAGE_CULTURE_ALIASES,
    }),
    ...resolveStandaloneConventions({
      cultures: STANDALONE_NAMING_CULTURES,
      bindings: CULTURE_CONVENTION_BINDINGS,
    }),
    ...listStaticConventions(),
  ]
}

function getConventionById(
  conventions: readonly NamingConvention[],
  conventionId: string,
): NamingConvention | undefined {
  return conventions.find((convention) => convention.id === conventionId)
}

async function loadConventionCollections(
  conventions: readonly NamingConvention[],
  conventionId: string,
) {
  const convention = getConventionById(conventions, conventionId)
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
  const conventions = composeIntegrationConventions()

  it('ranks dwarven personal above unrelated cultures for dwarf context', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['dwarvish'],
        cultureIds: ['dwarf'],
      },
      conventions,
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
        cultureIds: ['halfling'],
      },
      conventions,
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
        cultureIds: ['dragonborn'],
      },
      conventions,
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
        cultureIds: ['tiefling'],
      },
      conventions,
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
        cultureIds: ['gnome'],
      },
      conventions,
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
        cultureIds: ['goliath'],
      },
      conventions,
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
        cultureIds: ['orc'],
      },
      conventions,
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
      conventions,
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
    'draconic-dragon-personal',
    'draconic-dragonborn-personal',
    'draconic-dragonborn-clan',
    'dwarven-personal',
    'dwarven-settlement',
    'elvish-personal',
    'elvish-settlement',
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
    const { convention, collections } = await loadConventionCollections(conventions, conventionId)

    const request = { conventionId, count: 2, seed: `integration-${conventionId}` }
    const first = generateNames(convention, collections, request)
    const second = generateNames(convention, collections, request)

    expect(first).toEqual(second)
    expect(first.length).toBe(2)
  })
})
