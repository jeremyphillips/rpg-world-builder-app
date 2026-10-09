import { applyFilterSchema, countModifiedFilters, setFilterValue } from '@rpg/ui/filters'
import { describe, expect, it } from 'vitest'

import {
  createOrganizationRelationshipFilterSchema,
  resolveOrganizationRelationshipFilterLayout,
} from './organization-relationship-filter-schema'

type OrganizationRow = {
  id: string
  organizationDomain: string
}

const rows: OrganizationRow[] = [
  { id: 'guild', organizationDomain: 'occupational' },
  { id: 'council', organizationDomain: 'government' },
]

function createSchema(nextRows: readonly OrganizationRow[] = rows) {
  return createOrganizationRelationshipFilterSchema({
    rows: nextRows,
    getDomain: (row) => row.organizationDomain,
  })
}

describe('createOrganizationRelationshipFilterSchema', () => {
  it('offers All domains plus domains present on the rows', () => {
    const schema = createSchema()
    const field = schema.fields[0]

    expect(field?.type).toBe('select')
    if (field?.type !== 'select') return
    expect(field.allOptionLabel).toBe('All domains')
    expect(field.options).toEqual([
      { value: 'government', label: 'Government' },
      { value: 'occupational', label: 'Occupational' },
    ])
    expect(resolveOrganizationRelationshipFilterLayout(schema)).toEqual({
      filterRowFieldIds: ['domain'],
    })
  })

  it('hides the control when every row shares one domain', () => {
    const schema = createSchema([
      { id: 'guild', organizationDomain: 'occupational' },
      { id: 'lodge', organizationDomain: 'occupational' },
    ])

    expect(schema.fields).toEqual([])
  })

  it('counts a non-default domain and filters to that domain', () => {
    const schema = createSchema()
    const selected = setFilterValue(schema, {}, 'domain', 'government')

    expect(countModifiedFilters(schema, selected)).toBe(1)
    expect(applyFilterSchema(schema, selected, [...rows]).map((row) => row.id)).toEqual(['council'])
    expect(countModifiedFilters(schema, {})).toBe(0)
  })
})
