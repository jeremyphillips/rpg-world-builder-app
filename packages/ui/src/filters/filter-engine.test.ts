import { describe, expect, it } from 'vitest'

import {
  applyFilterSchema,
  countModifiedFilters,
  createInitialFilterState,
  getEffectiveFilterValue,
  isFilterConstraining,
  isFilterModified,
  resetFilterState,
  resolveFilterFieldPlacement,
  setFilterValue,
} from './filter-engine'
import {
  createBooleanFilter,
  createEqualsFilter,
  createTextFilter,
  normalizeTextFilterValue,
} from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'

type Row = {
  name: string
  sourceLabel: string
  status: 'draft' | 'published'
  hidden?: boolean
}

type TestFilterState = {
  search?: string
  status?: Row['status']
  campaignAvailability?: 'available' | 'unavailable' | 'all'
  hiddenOnly?: boolean
}

const rows: Row[] = [
  { name: 'Fireball', sourceLabel: 'SRD', status: 'published' },
  { name: 'Chill Touch', sourceLabel: 'Homebrew', status: 'draft' },
  { name: 'Magic Missile', sourceLabel: 'SRD', status: 'published', hidden: true },
]

const schema = createFilterSchema<Row, TestFilterState>([
  createTextFilter<Row, TestFilterState, 'search'>({
    id: 'search',
    label: 'Search',
    getSearchText: (row) => [row.name, row.sourceLabel],
  }),
  createEqualsFilter<Row, TestFilterState, 'status', Row['status']>({
    id: 'status',
    label: 'Status',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status,
  }),
  createEqualsFilter<
    Row,
    TestFilterState,
    'campaignAvailability',
    'available' | 'unavailable' | 'all'
  >({
    id: 'campaignAvailability',
    label: 'Availability',
    defaultValue: 'available',
    options: [
      { value: 'available', label: 'Available' },
      { value: 'unavailable', label: 'Unavailable' },
      { value: 'all', label: 'All' },
    ],
    getValue: () => 'available',
    isValueConstraining: (value) => value !== 'all',
  }),
  createBooleanFilter<Row, TestFilterState, 'hiddenOnly'>({
    id: 'hiddenOnly',
    label: 'Hidden only',
    getValue: (row) => row.hidden === true,
  }),
])

describe('filter-engine', () => {
  describe('defaults and effective values', () => {
    it('derives initial state from field defaultValue', () => {
      expect(createInitialFilterState(schema)).toEqual({ campaignAvailability: 'available' })
    })

    it('falls back to defaultValue when a key is absent', () => {
      const state = {} as TestFilterState
      expect(getEffectiveFilterValue(schema, state, 'campaignAvailability')).toBe('available')
    })

    it('prefers explicit state over defaultValue', () => {
      const state = { campaignAvailability: 'all' as const }
      expect(getEffectiveFilterValue(schema, state, 'campaignAvailability')).toBe('all')
    })
  })

  describe('constraining versus modified', () => {
    it('treats default availability as constraining but not modified', () => {
      const state = createInitialFilterState(schema)

      expect(isFilterConstraining(schema, state, 'campaignAvailability')).toBe(true)
      expect(isFilterModified(schema, state, 'campaignAvailability')).toBe(false)
    })

    it('treats explicit all as not constraining but modified', () => {
      const state = { campaignAvailability: 'all' as const }

      expect(isFilterConstraining(schema, state, 'campaignAvailability')).toBe(false)
      expect(isFilterModified(schema, state, 'campaignAvailability')).toBe(true)
    })

    it('uses custom isValueEqual when provided', () => {
      const customSchema = createFilterSchema<Row, Pick<TestFilterState, 'status'>>([
        createEqualsFilter<Row, Pick<TestFilterState, 'status'>, 'status', Row['status']>({
          id: 'status',
          label: 'Status',
          defaultValue: 'published',
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ],
          getValue: (row) => row.status,
          isValueEqual: (left, right) => left === right,
        }),
      ])

      expect(isFilterModified(customSchema, { status: 'published' }, 'status')).toBe(false)
      expect(isFilterModified(customSchema, { status: 'draft' }, 'status')).toBe(true)
    })
  })

  describe('unset and reset semantics', () => {
    it('removes keys when set to undefined', () => {
      const next = setFilterValue(schema, { status: 'draft' }, 'status', undefined)
      expect(next).toEqual({})
      expect('status' in next).toBe(false)
    })

    it('reset restores schema defaults only', () => {
      const dirty = {
        search: 'fire',
        status: 'draft' as const,
        campaignAvailability: 'all' as const,
      }

      expect(resetFilterState(schema)).toEqual({ campaignAvailability: 'available' })
      expect(resetFilterState(schema)).not.toEqual(dirty)
    })
  })

  describe('applyFilterSchema', () => {
    it('returns all rows when no filters constrain', () => {
      const state = { campaignAvailability: 'all' as const }
      expect(applyFilterSchema(schema, state, rows)).toEqual(rows)
    })

    it('filters by text, select, and boolean fields', () => {
      const state = {
        search: 'homebrew',
        status: 'draft' as const,
      }

      expect(applyFilterSchema(schema, state, rows)).toEqual([rows[1]])
    })

    it('skips matches when effective value is undefined', () => {
      const state = {} as TestFilterState
      expect(applyFilterSchema({ fields: [schema.fields[0]!] }, state, rows)).toEqual(rows)
    })

    it('skips matches when isValueConstraining returns false', () => {
      expect(applyFilterSchema(schema, { campaignAvailability: 'all' }, rows)).toEqual(rows)
    })

    it('filters hidden rows with boolean advanced field', () => {
      expect(applyFilterSchema(schema, { hiddenOnly: true }, rows)).toEqual([rows[2]])
    })

    it('excludes fields via excludeFieldIds', () => {
      const state = { campaignAvailability: 'unavailable' as const }

      expect(applyFilterSchema(schema, state, rows)).toEqual([])
      expect(
        applyFilterSchema(schema, state, rows, { excludeFieldIds: ['campaignAvailability'] }),
      ).toEqual(rows)
    })

    it('supports custom includeField predicates', () => {
      const state = { search: 'homebrew', status: 'draft' as const }

      expect(
        applyFilterSchema(schema, state, rows, {
          includeField: (field) => field.placement !== 'advanced',
        }),
      ).toEqual([rows[1]])
    })
  })

  describe('countModifiedFilters', () => {
    it('counts only modified fields', () => {
      const state = {
        search: 'fire',
        campaignAvailability: 'all' as const,
      }

      expect(countModifiedFilters(schema, state)).toBe(2)
    })

    it('scopes counts by placement', () => {
      const state = {
        search: 'fire',
        hiddenOnly: true,
      }

      expect(countModifiedFilters(schema, state, 'primary')).toBe(1)
      expect(countModifiedFilters(schema, state, 'advanced')).toBe(1)
    })
  })

  describe('resolveFilterFieldPlacement', () => {
    it('defaults text and select to primary', () => {
      expect(resolveFilterFieldPlacement(schema.fields[0]!)).toBe('primary')
      expect(resolveFilterFieldPlacement(schema.fields[1]!)).toBe('primary')
    })

    it('defaults boolean to advanced', () => {
      expect(resolveFilterFieldPlacement(schema.fields[3]!)).toBe('advanced')
    })
  })
})

describe('filter-engine.helpers', () => {
  describe('normalizeTextFilterValue', () => {
    it('trims and treats whitespace-only as unset', () => {
      expect(normalizeTextFilterValue('  fire  ')).toBe('fire')
      expect(normalizeTextFilterValue('   ')).toBeUndefined()
      expect(normalizeTextFilterValue(undefined)).toBeUndefined()
    })
  })

  describe('createTextFilter', () => {
    it('matches case-insensitively across configured fields', () => {
      const field = createTextFilter<Row, TestFilterState, 'search'>({
        id: 'search',
        label: 'Search',
        getSearchText: (row) => [row.name, row.sourceLabel],
      })

      expect(field.matches(rows[0]!, 'FIRE', {} as TestFilterState)).toBe(true)
      expect(field.matches(rows[0]!, 'srd', {} as TestFilterState)).toBe(true)
      expect(field.matches(rows[0]!, 'homebrew', {} as TestFilterState)).toBe(false)
    })

    it('does not constrain whitespace-only values', () => {
      const field = createTextFilter<Row, TestFilterState, 'search'>({
        id: 'search',
        label: 'Search',
        getSearchText: (row) => row.name,
      })

      expect(field.isValueConstraining?.('   ')).toBe(false)
    })
  })
})
