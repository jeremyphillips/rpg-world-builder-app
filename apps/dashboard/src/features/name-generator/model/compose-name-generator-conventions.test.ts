import { describe, expect, it } from 'vitest'

import { makeSpecies } from '@/test/fixtures/factories/species'
import { pickSpecies } from '@/test/fixtures/pick'

import { deriveFilterOptions } from './derive-filter-options'
import {
  buildCultureFilterContexts,
  composeNameGeneratorConventions,
  toSpeciesCultureInput,
} from './compose-name-generator-conventions'
import type { NameGeneratorFilters } from './name-generator-filters'

const ELF_SPECIES = makeSpecies({
  ...pickSpecies('elf'),
  culture: {
    id: 'elven',
    name: 'Elven',
    naming: { supported: true, personalNameComponents: ['family'] },
  },
})

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
