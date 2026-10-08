import { applyFilterSchema, countModifiedFilters, setFilterValue } from '@rpg/ui/filters'
import { describe, expect, it } from 'vitest'

import {
  createLocationRelationshipFilterSchema,
  resolveLocationRelationshipFilterLayout,
} from './location-relationship-filter-schema'

type LocationRow = {
  id: string
  kind: string
}

const rows: LocationRow[] = [
  { id: 'market', kind: 'site' },
  { id: 'keep', kind: 'structure' },
  { id: 'gate', kind: 'site' },
]

function createSchema(nextRows: readonly LocationRow[] = rows) {
  return createLocationRelationshipFilterSchema({
    rows: nextRows,
    getKind: (row) => row.kind,
  })
}

describe('createLocationRelationshipFilterSchema', () => {
  it('offers All plus location kinds present on the rows', () => {
    const schema = createSchema()
    const field = schema.fields[0]

    expect(field?.type).toBe('select')
    if (field?.type !== 'select') return
    expect(field.label).toBe('Type')
    expect(field.allOptionLabel).toBe('All')
    expect(field.options).toEqual([
      { value: 'site', label: 'Site' },
      { value: 'structure', label: 'Structure' },
    ])
    expect(resolveLocationRelationshipFilterLayout(schema)).toEqual({
      filterRowFieldIds: ['kind'],
    })
  })

  it('hides the control when every row shares one kind', () => {
    const schema = createSchema([
      { id: 'market', kind: 'site' },
      { id: 'gate', kind: 'site' },
    ])

    expect(schema.fields).toEqual([])
  })

  it('counts a non-default kind and filters to that kind', () => {
    const schema = createSchema()
    const selected = setFilterValue(schema, {}, 'kind', 'structure')

    expect(countModifiedFilters(schema, selected)).toBe(1)
    expect(applyFilterSchema(schema, selected, [...rows]).map((row) => row.id)).toEqual(['keep'])
  })
})
