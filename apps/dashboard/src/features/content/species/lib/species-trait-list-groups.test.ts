import { describe, expect, it } from 'vitest'

import { buildSpeciesTraitListGroups } from './species-trait-list-groups'
import type { TraitRowForm } from './species-trait-form-fields'

describe('buildSpeciesTraitListGroups', () => {
  it('partitions sense templates into Senses and omits an empty Senses section', () => {
    const groups = buildSpeciesTraitListGroups([
      {
        row: {
          kind: 'template',
          templateId: 'sense-darkvision',
          config: { range: 60 },
          grants: [],
        } as TraitRowForm,
        item: { id: 'darkvision', title: 'Darkvision' },
      },
      {
        row: {
          kind: 'custom',
          name: 'Fey Ancestry',
          grants: [],
        } as TraitRowForm,
        item: { id: 'fey-ancestry', title: 'Fey Ancestry' },
      },
    ])

    expect(groups.map((group) => group.id)).toEqual(['senses', 'other'])
    expect(groups[0]?.items.map((item) => item.id)).toEqual(['darkvision'])
    expect(groups[1]?.items.map((item) => item.id)).toEqual(['fey-ancestry'])
  })

  it('keeps renamed sense rows in the Senses group via template id', () => {
    const groups = buildSpeciesTraitListGroups([
      {
        row: {
          kind: 'template',
          templateId: 'sense-darkvision',
          nameOverride: 'Superior Darkvision',
          config: { range: 120 },
          grants: [],
        } as TraitRowForm,
        item: { id: 'darkvision', title: 'Superior Darkvision' },
      },
    ])

    expect(groups[0]?.id).toBe('senses')
    expect(groups[0]?.items[0]?.title).toBe('Superior Darkvision')
  })
})
