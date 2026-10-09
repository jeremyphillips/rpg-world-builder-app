import {
  applyFilterSchema,
  countModifiedFilters,
  sanitizeFilterState,
  setFilterValue,
} from '@rpg/ui/filters'
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

    expect(field?.type).toBe('chips')
    if (field?.type !== 'chips') return
    expect(field.label).toBe('Location type')
    expect(field.options).toEqual([
      { value: 'all', label: 'All' },
      { value: 'sites', label: 'Sites' },
      { value: 'structures', label: 'Structures' },
    ])

    const kindField = schema.fields.find((candidate) => candidate.id === 'kind')
    expect(kindField?.type).toBe('select')
    if (kindField?.type !== 'select' || typeof kindField.options !== 'function') return
    expect(kindField.options({ state: {}, data: rows })).toEqual([
      { value: 'site', label: 'Site' },
      { value: 'structure', label: 'Structure' },
    ])
    expect(resolveLocationRelationshipFilterLayout(schema)).toEqual({
      primaryFieldIds: ['kindFamily'],
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

  it('filters by kind family and drops a type outside that family', () => {
    const schema = createSchema()
    const selected = setFilterValue(schema, { kind: 'structure' }, 'kindFamily', 'sites')
    const sanitized = sanitizeFilterState(schema, selected)

    expect(sanitized.kind).toBeUndefined()
    expect(applyFilterSchema(schema, sanitized, [...rows]).map((row) => row.id)).toEqual([
      'market',
      'gate',
    ])

    const kindField = schema.fields.find((field) => field.id === 'kind')
    if (kindField?.type !== 'select' || typeof kindField.options !== 'function') {
      throw new Error('expected a dependent type select')
    }
    expect(kindField.options({ state: sanitized, data: rows })).toEqual([
      { value: 'site', label: 'Site' },
    ])
    expect(kindField.visible?.(sanitized)).toBe(false)
  })

  it('uses caller families and hides the field when only one family is present', () => {
    const schema = createLocationRelationshipFilterSchema({
      rows: [...rows, { id: 'march', kind: 'region' }],
      getKind: (row) => row.kind,
      kindFamilies: [
        { id: 'region', label: 'Regions', matchesKind: (kind) => kind === 'region' },
        {
          id: 'settlement',
          label: 'Settlements',
          matchesKind: (kind) => kind === 'site' || kind === 'structure',
        },
      ],
    })

    expect(schema.fields.map((field) => field.id)).toEqual(['kindFamily', 'kind'])

    const regionOnly = createLocationRelationshipFilterSchema({
      rows: [{ id: 'march', kind: 'region' }],
      getKind: (row) => row.kind,
      kindFamilies: [
        { id: 'region', label: 'Regions', matchesKind: (kind) => kind === 'region' },
        {
          id: 'settlement',
          label: 'Settlements',
          matchesKind: (kind) => kind === 'settlement',
        },
      ],
    })
    expect(regionOnly.fields).toEqual([])
  })
})
