import { describe, expect, it } from 'vitest'

import {
  createBooleanFilter,
  createEqualsFilter,
  createTextFilter,
} from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import {
  hydrateFilterState,
  parseFilterSearchParams,
  serializeFilterSearchParams,
} from './filter-persistence'

type Row = {
  name: string
  status: 'draft' | 'published'
}

type TestFilterState = {
  search?: string
  status?: Row['status']
  campaignAvailability?: 'available' | 'unavailable' | 'all'
  hiddenOnly?: boolean
}

const schema = createFilterSchema<Row, TestFilterState>([
  createTextFilter<Row, TestFilterState, 'search'>({
    id: 'search',
    label: 'Search',
    getSearchText: (row) => row.name,
    url: { key: 'q' },
  }),
  createEqualsFilter<Row, TestFilterState, 'status', Row['status']>({
    id: 'status',
    label: 'Status',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status,
    showAllOption: true,
  }),
  createEqualsFilter<Row, TestFilterState, 'campaignAvailability', 'available' | 'unavailable' | 'all'>({
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
    url: { key: 'availability' },
  }),
  createBooleanFilter<Row, TestFilterState, 'hiddenOnly'>({
    id: 'hiddenOnly',
    label: 'Hidden only',
    getValue: () => false,
  }),
])

describe('filter-persistence', () => {
  describe('parseFilterSearchParams', () => {
    it('ignores unknown URL keys', () => {
      expect(
        parseFilterSearchParams(schema, new URLSearchParams('sort=name&page=2')),
      ).toEqual({})
    })

    it('parses text, select, and boolean values', () => {
      expect(
        parseFilterSearchParams(
          schema,
          new URLSearchParams('q=fire&status=draft&hiddenOnly=true'),
        ),
      ).toEqual({
        search: 'fire',
        status: 'draft',
        hiddenOnly: true,
      })
    })

    it('trims text and treats whitespace-only values as unset without a default', () => {
      expect(parseFilterSearchParams(schema, new URLSearchParams('q=%20%20'))).toEqual({})
    })

    it('falls back to schema defaults for invalid explicit values', () => {
      expect(parseFilterSearchParams(schema, new URLSearchParams('availability=garbage'))).toEqual({
        campaignAvailability: 'available',
      })
    })

    it('does not treat invalid values as unset when unset differs from default', () => {
      const parsed = parseFilterSearchParams(schema, { availability: 'garbage' })
      expect(parsed.campaignAvailability).toBe('available')
      expect(parsed.campaignAvailability).not.toBeUndefined()
    })

    it('supports custom URL keys', () => {
      expect(parseFilterSearchParams(schema, new URLSearchParams('q=spell'))).toEqual({
        search: 'spell',
      })
    })

    it('uses custom parse overrides', () => {
      const customSchema = createFilterSchema<Row, TestFilterState>([
        createEqualsFilter<Row, TestFilterState, 'status', Row['status']>({
          id: 'status',
          label: 'Status',
          options: [{ value: 'draft', label: 'Draft' }],
          getValue: (row) => row.status,
          url: {
            parse: (raw) => (raw === 'wip' ? 'draft' : undefined),
          },
        }),
      ])

      expect(parseFilterSearchParams(customSchema, new URLSearchParams('status=wip'))).toEqual({
        status: 'draft',
      })
    })
  })

  describe('serializeFilterSearchParams', () => {
    it('omits schema defaults from the URL', () => {
      expect(
        serializeFilterSearchParams(schema, { campaignAvailability: 'available' }).toString(),
      ).toBe('')
    })

    it('serializes non-default filter values', () => {
      const params = serializeFilterSearchParams(schema, {
        search: ' fire ',
        status: 'draft',
        campaignAvailability: 'all',
        hiddenOnly: true,
      })

      expect(params.get('q')).toBe('fire')
      expect(params.get('status')).toBe('draft')
      expect(params.get('availability')).toBe('all')
      expect(params.get('hiddenOnly')).toBe('true')
    })

    it('omits whitespace-only search text', () => {
      const params = serializeFilterSearchParams(schema, { search: '   ' })
      expect(params.get('q')).toBeNull()
    })

    it('respects omitDefault: false', () => {
      const customSchema = createFilterSchema<Row, TestFilterState>([
        createEqualsFilter<Row, TestFilterState, 'status', Row['status']>({
          id: 'status',
          label: 'Status',
          defaultValue: 'published',
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ],
          getValue: (row) => row.status,
          url: { omitDefault: false },
        }),
      ])

      expect(
        serializeFilterSearchParams(customSchema, { status: 'published' }).get('status'),
      ).toBe('published')
    })

    it('uses custom serialize overrides', () => {
      const customSchema = createFilterSchema<Row, TestFilterState>([
        createTextFilter<Row, TestFilterState, 'search'>({
          id: 'search',
          label: 'Search',
          getSearchText: (row) => row.name,
          url: {
            serialize: (value) => (typeof value === 'string' ? value.toUpperCase() : undefined),
          },
        }),
      ])

      expect(serializeFilterSearchParams(customSchema, { search: 'fire' }).get('search')).toBe(
        'FIRE',
      )
    })
  })

  describe('hydrateFilterState', () => {
    it('merges defaults with parsed URL values', () => {
      expect(
        hydrateFilterState(schema, new URLSearchParams('status=draft')),
      ).toEqual({
        campaignAvailability: 'available',
        status: 'draft',
      })
    })

    it('round-trips non-default state through serialize and parse', () => {
      const state = {
        search: 'fire',
        status: 'draft' as const,
        campaignAvailability: 'all' as const,
      }

      const params = serializeFilterSearchParams(schema, state)
      expect(hydrateFilterState(schema, params)).toEqual({
        campaignAvailability: 'all',
        search: 'fire',
        status: 'draft',
      })
    })
  })
})
