import { describe, expect, it } from 'vitest'

import type { Species } from '@rpg/contracts'

import { deriveFilterOptions } from './derive-filter-options'
import {
  buildCultureFilterContexts,
  composeNameGeneratorConventions,
  toSpeciesCultureInput,
} from './compose-name-generator-conventions'
import type { NameGeneratorFilters } from './name-generator-filters'

const ELF_SPECIES = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  name: 'Elf',
  source: 'system',
  campaignId: null,
  rulesetId: 'srd-cc-5.2.1',
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: { walk: 30 },
  languageAffinities: ['elvish'],
  traits: [],
  culture: {
    id: 'elven',
    name: 'Elven',
    naming: { supported: true, personalNameComponents: ['family'] },
  },
} satisfies Species

describe('toSpeciesCultureInput', () => {
  it('preserves language affinities for naming resolution', () => {
    expect(toSpeciesCultureInput(ELF_SPECIES).languageAffinities).toEqual(['elvish'])
  })
})

describe('composeNameGeneratorConventions', () => {
  it('injects elvish language associations for campaign elf species', () => {
    const speciesInput = toSpeciesCultureInput(ELF_SPECIES)
    const { conventions } = composeNameGeneratorConventions([speciesInput])
    const elvishPersonal = conventions.find((convention) => convention.id === 'elvish-personal')

    expect(elvishPersonal?.associations).toEqual(
      expect.arrayContaining([{ kind: 'language', languageId: 'elvish', strength: 'primary' }]),
    )
  })
})

describe('elf species language filter options', () => {
  it('offers elvish when species is filtered to elf', () => {
    const speciesInput = toSpeciesCultureInput(ELF_SPECIES)
    const { conventions, speciesNamingOptions } = composeNameGeneratorConventions([speciesInput])
    const cultures = buildCultureFilterContexts([speciesInput])
    const filters = {
      subjectKind: 'person',
      speciesId: ELF_SPECIES.id,
      cultureId: 'elven',
    } as NameGeneratorFilters

    const options = deriveFilterOptions(filters, conventions, {
      speciesNamingOptions,
      cultures,
    })

    expect(options.languageIds.some((option) => option.id === 'elvish')).toBe(true)
  })
})
