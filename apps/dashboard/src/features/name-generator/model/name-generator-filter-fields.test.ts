import { describe, expect, it } from 'vitest'
import { listConventions } from '@rpg/name-generator-data'

import { deriveFilterOptions, deriveVisibleFilters } from './derive-filter-options'
import { buildNameGeneratorFilterFields } from './name-generator-filter-fields'
import { resetNameGeneratorFilters } from './sanitize-filters-on-change'

describe('buildNameGeneratorFilterFields', () => {
  const conventions = listConventions()

  it('includes optional species field only when visible for person', () => {
    const filters = resetNameGeneratorFilters()
    const fields = buildNameGeneratorFilterFields({
      filterOptions: deriveFilterOptions(filters, conventions),
      visibleFilters: deriveVisibleFilters(filters, conventions),
    })

    expect(fields.find((field) => field.key === 'speciesId')).toMatchObject({
      allowAny: true,
      visible: true,
    })
  })

  it('hides species for settlement subject visibility', () => {
    const filters = { subjectKind: 'settlement' as const }
    const fields = buildNameGeneratorFilterFields({
      filterOptions: deriveFilterOptions(filters, conventions),
      visibleFilters: deriveVisibleFilters(filters, conventions),
    })

    expect(fields.find((field) => field.key === 'speciesId')?.visible).toBe(false)
  })
})
