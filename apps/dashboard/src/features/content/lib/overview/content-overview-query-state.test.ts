import { describe, expect, it } from 'vitest'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
} from '@rpg/ui/filters'

import {
  CONTENT_OVERVIEW_DEFAULT_PAGE,
  CONTENT_OVERVIEW_PAGE_PARAM,
  CONTENT_OVERVIEW_SORT_PARAM,
  hydrateOverviewQuery,
  parseOverviewPage,
  parseOverviewSort,
  serializeOverviewPage,
  serializeOverviewQuery,
  serializeOverviewSort,
} from './content-overview-query-state'

type Row = {
  name: string
  status: 'draft' | 'published'
}

type TestFilterState = {
  search?: string
  status?: Row['status']
  campaignAvailability?: 'available' | 'unavailable' | 'all'
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
])

const allowedSortIds = ['name', 'status'] as const
const defaultSort = { id: 'name' } as const

describe('content-overview-query-state', () => {
  describe('parseOverviewSort', () => {
    it('parses ascending and descending sort ids', () => {
      expect(parseOverviewSort('name', allowedSortIds)).toEqual({ id: 'name' })
      expect(parseOverviewSort('-status', allowedSortIds)).toEqual({ id: 'status', desc: true })
    })

    it('discards unknown sort ids', () => {
      expect(parseOverviewSort('cost', allowedSortIds)).toBeUndefined()
    })
  })

  describe('serializeOverviewSort', () => {
    it('omits the canonical default sort', () => {
      expect(serializeOverviewSort(defaultSort, defaultSort)).toBeUndefined()
      expect(serializeOverviewSort({ id: 'status', desc: true }, defaultSort)).toBe('-status')
    })
  })

  describe('parseOverviewPage / serializeOverviewPage', () => {
    it('defaults invalid pages to 1 and omits page 1 from the URL', () => {
      expect(parseOverviewPage(undefined)).toBe(CONTENT_OVERVIEW_DEFAULT_PAGE)
      expect(parseOverviewPage('0')).toBe(CONTENT_OVERVIEW_DEFAULT_PAGE)
      expect(parseOverviewPage('garbage')).toBe(CONTENT_OVERVIEW_DEFAULT_PAGE)
      expect(serializeOverviewPage(1)).toBeUndefined()
      expect(serializeOverviewPage(3)).toBe('3')
    })
  })

  describe('hydrateOverviewQuery', () => {
    it('merges filter hydration with sort and page', () => {
      expect(
        hydrateOverviewQuery({
          schema,
          searchParams: new URLSearchParams('q=fire&status=draft&sort=-status&page=2'),
          allowedSortIds,
          defaultSort,
        }),
      ).toEqual({
        filters: {
          campaignAvailability: 'available',
          search: 'fire',
          status: 'draft',
        },
        sort: { id: 'status', desc: true },
        page: 2,
      })
    })

    it('falls back to the default sort when the URL sort is invalid', () => {
      expect(
        hydrateOverviewQuery({
          schema,
          searchParams: new URLSearchParams('sort=cost'),
          allowedSortIds,
          defaultSort,
        }).sort,
      ).toEqual(defaultSort)
    })
  })

  describe('serializeOverviewQuery', () => {
    it('composes filter, sort, and page params while omitting defaults', () => {
      const params = serializeOverviewQuery({
        schema,
        defaultSort,
        query: {
          filters: {
            campaignAvailability: 'available',
            search: 'fire',
            status: 'draft',
          },
          sort: defaultSort,
          page: 1,
        },
      })

      expect(params.get('q')).toBe('fire')
      expect(params.get('status')).toBe('draft')
      expect(params.get('availability')).toBeNull()
      expect(params.get(CONTENT_OVERVIEW_SORT_PARAM)).toBeNull()
      expect(params.get(CONTENT_OVERVIEW_PAGE_PARAM)).toBeNull()
    })

    it('round-trips non-default query state', () => {
      const query = {
        filters: {
          campaignAvailability: 'all' as const,
          status: 'draft' as const,
        },
        sort: { id: 'status', desc: true } as const,
        page: 3,
      }

      const params = serializeOverviewQuery({ schema, defaultSort, query })
      expect(
        hydrateOverviewQuery({
          schema,
          searchParams: params,
          allowedSortIds,
          defaultSort,
        }),
      ).toEqual(query)
    })
  })
})
