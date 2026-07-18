import { describe, expect, it } from 'vitest'

import { NAME_SUBJECT_KIND_ENTRIES, toVocabOptions } from '@rpg/contracts/name-generator'
import { CONVENTIONS } from '@rpg/name-generator-data'

import { deriveFilterOptions } from './derive-filter-options'
import type { NameGeneratorFilters } from './name-generator-filters'

const subjectKindLabelById = new Map(
  toVocabOptions(NAME_SUBJECT_KIND_ENTRIES).map((option) => [option.value, option.label]),
)

describe('deriveFilterOptions subject kind labels', () => {
  it('labels every convention-derived subject kind from contracts vocab', () => {
    const conventionSubjectKinds = new Set(
      CONVENTIONS.flatMap((convention) => convention.subjectKinds),
    )

    for (const subjectKind of conventionSubjectKinds) {
      expect(subjectKindLabelById.has(subjectKind)).toBe(true)
    }
  })

  it('builds subject filter options without raw-id fallbacks', () => {
    const filters = { subjectKind: 'person' } as NameGeneratorFilters
    const options = deriveFilterOptions(filters, CONVENTIONS)

    expect(options.subjectKinds.every((option) => option.label !== option.id)).toBe(true)
  })
})
