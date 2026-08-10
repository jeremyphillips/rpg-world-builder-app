import { describe, expect, it } from 'vitest'

import { generateName } from '@rpg/name-generator-core'
import { HERITAGE_CULTURE_ALIASES, loadNameCollection } from '@rpg/name-generator-data'

import { composeAvailableNamingConventions } from './compose-available-naming-conventions'
import { resolveSpeciesPersonNaming } from './resolve-species-person-naming'
import type { SpeciesCultureInput } from './resolve-campaign-conventions'
import {
  HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
  SPECIES_NAMING_UNSUPPORTED_REASON,
} from './build-species-naming-options'

const namingCapableDwarf: SpeciesCultureInput = {
  id: 'srd-cc-5.2.1:dwarf',
  slug: 'dwarf',
  name: 'Dwarf',
  source: 'system',
  culture: { naming: { supported: true, personalNameComponents: ['clan'] } },
  languageAffinities: ['dwarvish'],
}

const unsupportedSpecies: SpeciesCultureInput = {
  id: 'srd-cc-5.2.1:customfolk',
  slug: 'customfolk',
  name: 'Customfolk',
  source: 'system',
}

const homebrewSpecies: SpeciesCultureInput = {
  id: 'homebrew:river-folk',
  slug: 'river-folk',
  name: 'River Folk',
  source: 'homebrew',
  culture: { naming: { supported: true } },
}

describe('resolveSpeciesPersonNaming', () => {
  it('resolves dwarf person naming with culture context and convention ids', () => {
    const conventions = composeAvailableNamingConventions([namingCapableDwarf])
    const resolution = resolveSpeciesPersonNaming({
      species: namingCapableDwarf,
      conventions: conventions.conventions,
      heritageAliases: HERITAGE_CULTURE_ALIASES,
    })

    expect(resolution.supported).toBe(true)
    if (!resolution.supported) return

    expect(resolution.context.subjectKind).toBe('person')
    expect(resolution.context.cultureIds).toEqual(['dwarf'])
    expect(resolution.context.languageIds).toEqual(['dwarvish'])
    expect(resolution.conventionIds.length).toBeGreaterThan(0)
  })

  it('generates a non-empty dwarf name from the resolved convention', async () => {
    const conventions = composeAvailableNamingConventions([namingCapableDwarf])
    const resolution = resolveSpeciesPersonNaming({
      species: namingCapableDwarf,
      conventions: conventions.conventions,
      heritageAliases: HERITAGE_CULTURE_ALIASES,
    })

    expect(resolution.supported).toBe(true)
    if (!resolution.supported) return

    const convention = conventions.getConvention(resolution.conventionIds[0]!)
    expect(convention).toBeDefined()
    if (!convention) return

    const collections = new Map(
      await Promise.all(
        convention.collectionIds.map(
          async (collectionId) => [collectionId, await loadNameCollection(collectionId)] as const,
        ),
      ),
    )

    const generated = generateName(
      convention,
      collections,
      {
        conventionId: convention.id,
        count: 1,
        seed: 'test-seed',
        genderStyle: 'neutral',
      },
      0,
      new Set<string>(),
    )

    expect(generated.value.trim().length).toBeGreaterThan(0)
  })

  it('reports unsupported species with the canonical reason', () => {
    const composed = composeAvailableNamingConventions([unsupportedSpecies])
    const resolution = resolveSpeciesPersonNaming({
      species: unsupportedSpecies,
      conventions: composed.conventions,
    })

    expect(resolution).toEqual({
      supported: false,
      reason: SPECIES_NAMING_UNSUPPORTED_REASON,
    })
  })

  it('inherits homebrew naming policy from buildSpeciesNamingOption', () => {
    const composed = composeAvailableNamingConventions([homebrewSpecies])
    const resolution = resolveSpeciesPersonNaming({
      species: homebrewSpecies,
      conventions: composed.conventions,
    })

    expect(resolution).toEqual({
      supported: false,
      reason: HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
    })
  })
})
