import { describe, expect, it } from 'vitest'

import { NAME_SUBJECT_KIND_ENTRIES, toVocabOptions } from '@rpg/contracts/name-generator'
import { ELVISH_PERSONAL_CONVENTION } from '@rpg/contracts/name-generator/test-fixtures'
import { STATIC_CONVENTIONS } from '@rpg/name-generator-data'

import { deriveFilterOptions, isFilterValueValid } from './derive-filter-options'
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
