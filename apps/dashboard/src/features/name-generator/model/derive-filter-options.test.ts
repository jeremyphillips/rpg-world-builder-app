import { describe, expect, it } from 'vitest'

import { buildNamingContext } from './build-naming-context'
import { deriveFilterOptions, deriveVisibleFilters } from './derive-filter-options'
import { resetNameGeneratorFilters, sanitizeFiltersOnChange } from './sanitize-filters-on-change'
import { listConventions } from '@rpg/name-generator-data'

describe('deriveFilterOptions', () => {
  const conventions = listConventions()

  it('narrows language options when elf species is selected', () => {
    const options = deriveFilterOptions(
      { subjectKind: 'person', speciesId: 'srd-cc-5.2.1:elf' },
      conventions,
    )

    expect(options.languageIds.map((option) => option.id)).toContain('elvish')
  })

  it('includes akan culture for person subject', () => {
    const options = deriveFilterOptions({ subjectKind: 'person' }, conventions)

    expect(options.cultureIds.map((option) => option.id)).toContain('akan')
    expect(options.cultureIds.map((option) => option.id)).toContain('high-elven')
  })
})

describe('deriveVisibleFilters', () => {
  const conventions = listConventions()

  it('shows species and gender filters for person', () => {
    expect(deriveVisibleFilters({ subjectKind: 'person' }, conventions)).toEqual({
      species: true,
      language: true,
      culture: true,
      genderStyle: true,
    })
  })

  it('hides species for settlement subject', () => {
    expect(deriveVisibleFilters({ subjectKind: 'settlement' }, conventions)).toEqual({
      species: false,
      language: true,
      culture: true,
      genderStyle: false,
    })
  })
})

describe('sanitizeFiltersOnChange', () => {
  const conventions = listConventions()

  it('clears species when subject changes away from person', () => {
    const next = sanitizeFiltersOnChange(
      { subjectKind: 'person', speciesId: 'srd-cc-5.2.1:elf' },
      { subjectKind: 'settlement', speciesId: 'srd-cc-5.2.1:elf' },
      conventions,
    )

    expect(next).toEqual({ subjectKind: 'settlement' })
  })

  it('preserves unrelated valid filters', () => {
    const next = sanitizeFiltersOnChange(
      { subjectKind: 'person', languageId: 'elvish' },
      { subjectKind: 'person', languageId: 'elvish', genderStyle: 'feminine' },
      conventions,
    )

    expect(next).toEqual({
      subjectKind: 'person',
      languageId: 'elvish',
      genderStyle: 'feminine',
    })
  })
})

describe('resetNameGeneratorFilters', () => {
  it('returns person defaults', () => {
    expect(resetNameGeneratorFilters()).toEqual({ subjectKind: 'person' })
  })
})

describe('buildNamingContext', () => {
  it('maps optional filters to naming context arrays', () => {
    expect(
      buildNamingContext({
        subjectKind: 'person',
        languageId: 'elvish',
        cultureId: 'high-elven',
        speciesId: 'srd-cc-5.2.1:elf',
      }),
    ).toEqual({
      subjectKind: 'person',
      languageIds: ['elvish'],
      cultureIds: ['high-elven'],
      speciesIds: ['srd-cc-5.2.1:elf'],
    })
  })
})
