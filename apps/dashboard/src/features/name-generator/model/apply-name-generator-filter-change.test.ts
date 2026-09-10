import { describe, expect, it } from 'vitest'

import { ELVISH_PERSONAL_CONVENTION } from '@rpg/contracts/name-generator/test-fixtures'
import type { SpeciesNamingOption } from '@rpg/name-generator-integrations'

import { applyNameGeneratorFilterChange } from './apply-name-generator-filter-change'
import type { NameGeneratorFilters } from './name-generator-filters'

const ELF_SPECIES_ID = 'srd-cc-5.2.1:elf'

const speciesNamingOptions: SpeciesNamingOption[] = [
  {
    speciesId: ELF_SPECIES_ID,
    label: 'Elf',
    disabled: false,
    cultureIds: ['elven'],
    subjectKinds: ['person'],
    heritageOptions: [
      { id: 'drow', label: 'Drow', cultureId: 'elven-drow' },
      { id: 'wood-elf', label: 'Wood Elf', cultureId: 'elven-wood' },
    ],
  },
]

const cultureContexts = [
  { id: 'elven', label: 'Elven', languageIds: ['elvish'] },
  { id: 'elven-drow', label: 'Drow', languageIds: ['elvish', 'undercommon'] },
]

function applyChange(
  filters: NameGeneratorFilters,
  key: keyof NameGeneratorFilters,
  value: string | undefined,
): NameGeneratorFilters {
  return applyNameGeneratorFilterChange({
    filters,
    key,
    value,
    speciesNamingOptions,
    conventions: [ELVISH_PERSONAL_CONVENTION],
    cultureContexts,
  })
}

describe('applyNameGeneratorFilterChange heritage routing', () => {
  it('selects the culture a heritage routes to', () => {
    const next = applyChange(
      { subjectKind: 'person', speciesId: ELF_SPECIES_ID, cultureId: 'elven' },
      'heritageId',
      'drow',
    )

    expect(next).toMatchObject({ heritageId: 'drow', cultureId: 'elven-drow' })
  })

  it('clears the heritage when the species changes', () => {
    const next = applyChange(
      { subjectKind: 'person', speciesId: ELF_SPECIES_ID, heritageId: 'drow' },
      'speciesId',
      ELF_SPECIES_ID,
    )

    expect(next.heritageId).toBeUndefined()
    expect(next.cultureId).toBe('elven')
  })

  it('clears the heritage when the filter is reset to all', () => {
    const next = applyChange(
      { subjectKind: 'person', speciesId: ELF_SPECIES_ID, heritageId: 'drow' },
      'heritageId',
      '',
    )

    expect(next.heritageId).toBeUndefined()
  })
})
