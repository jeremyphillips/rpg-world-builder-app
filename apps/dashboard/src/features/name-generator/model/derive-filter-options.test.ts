import { describe, expect, it } from 'vitest'

import { NAME_SUBJECT_KIND_ENTRIES, toVocabOptions } from '@rpg/contracts/name-generator'
import { ELVISH_PERSONAL_CONVENTION } from '@rpg/contracts/name-generator/test-fixtures'
import { STATIC_CONVENTIONS } from '@rpg/name-generator-data'

import {
  deriveFilterOptions,
  deriveVisibleFilters,
  isFilterValueValid,
} from './derive-filter-options'
import type { NameGeneratorFilters } from './name-generator-filters'
import type { SpeciesNamingOption } from '@rpg/name-generator-integrations'

const subjectKindLabelById = new Map(
  toVocabOptions(NAME_SUBJECT_KIND_ENTRIES).map((option) => [option.value, option.label]),
)

const filterContext = {
  speciesNamingOptions: [
    {
      speciesId: 'srd-cc-5.2.1:elf',
      label: 'Elf',
      disabled: false,
      cultureIds: ['elven'],
      subjectKinds: ['person'],
    },
  ] satisfies SpeciesNamingOption[],
  cultures: [{ id: 'elven', label: 'Elven', languageIds: ['elvish'] }],
}

describe('deriveFilterOptions subject kind labels', () => {
  it('labels every convention-derived subject kind from contracts vocab', () => {
    const conventionSubjectKinds = new Set(
      STATIC_CONVENTIONS.flatMap((convention) => convention.subjectKinds),
    )

    for (const subjectKind of conventionSubjectKinds) {
      expect(subjectKindLabelById.has(subjectKind)).toBe(true)
    }
  })

  it('builds subject filter options without raw-id fallbacks', () => {
    const filters = { subjectKind: 'person' } as NameGeneratorFilters
    const options = deriveFilterOptions(filters, STATIC_CONVENTIONS)

    expect(options.subjectKinds.every((option) => option.label !== option.id)).toBe(true)
  })

  it('treats elvish as a valid language when campaign conventions are composed', () => {
    const filters = { subjectKind: 'person', languageId: 'elvish' } as NameGeneratorFilters
    const options = deriveFilterOptions(
      filters,
      [ELVISH_PERSONAL_CONVENTION, ...STATIC_CONVENTIONS],
      filterContext,
    )

    expect(isFilterValueValid('languageId', 'elvish', options)).toBe(true)
  })
})

const heritageFilterContext = {
  speciesNamingOptions: [
    {
      speciesId: 'srd-cc-5.2.1:elf',
      label: 'Elf',
      disabled: false,
      cultureIds: ['elven'],
      subjectKinds: ['person'],
      heritageOptions: [{ id: 'drow', label: 'Drow', cultureId: 'elven-drow' }],
    },
  ] satisfies SpeciesNamingOption[],
  cultures: [
    { id: 'elven', label: 'Elven', languageIds: ['elvish'] },
    { id: 'elven-drow', label: 'Drow', languageIds: ['elvish', 'undercommon'] },
  ],
}

const ELVISH_DROW_PERSONAL_CONVENTION = {
  ...ELVISH_PERSONAL_CONVENTION,
  id: 'elvish-drow-personal',
  associations: [
    { kind: 'culture' as const, cultureId: 'elven-drow', strength: 'primary' as const },
    { kind: 'language' as const, languageId: 'elvish', strength: 'primary' as const },
    { kind: 'language' as const, languageId: 'undercommon', strength: 'primary' as const },
  ],
}

describe('deriveFilterOptions heritage', () => {
  const conventions = [
    ELVISH_PERSONAL_CONVENTION,
    ELVISH_DROW_PERSONAL_CONVENTION,
    ...STATIC_CONVENTIONS,
  ]

  it('offers heritage options only once a species with naming-relevant heritages is selected', () => {
    const withoutSpecies = { subjectKind: 'person' } as NameGeneratorFilters
    const withSpecies = {
      subjectKind: 'person',
      speciesId: 'srd-cc-5.2.1:elf',
    } as NameGeneratorFilters

    expect(
      deriveFilterOptions(withoutSpecies, conventions, heritageFilterContext).heritageIds,
    ).toEqual([])
    expect(deriveVisibleFilters(withoutSpecies, conventions, heritageFilterContext).heritage).toBe(
      false,
    )
    expect(
      deriveFilterOptions(withSpecies, conventions, heritageFilterContext).heritageIds,
    ).toEqual([{ id: 'drow', label: 'Drow' }])
    expect(deriveVisibleFilters(withSpecies, conventions, heritageFilterContext).heritage).toBe(
      true,
    )
  })

  it('keeps a heritage-routed culture selectable for the species', () => {
    const filters = {
      subjectKind: 'person',
      speciesId: 'srd-cc-5.2.1:elf',
      heritageId: 'drow',
      cultureId: 'elven-drow',
    } as NameGeneratorFilters
    const options = deriveFilterOptions(filters, conventions, heritageFilterContext)

    expect(isFilterValueValid('heritageId', 'drow', options)).toBe(true)
    expect(isFilterValueValid('cultureId', 'elven-drow', options)).toBe(true)
  })
})
