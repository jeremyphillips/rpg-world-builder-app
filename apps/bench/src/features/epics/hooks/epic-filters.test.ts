import { describe, expect, it } from 'vitest'

import { applyEpicFilters, filtersFromSearchParams, filtersToSearchParams } from './epic-filters'

const sampleEpics = [
  {
    id: '1',
    title: 'Rules',
    status: 'active' as const,
    area: 'rules',
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
  },
  {
    id: '2',
    title: 'UI polish',
    status: 'paused' as const,
    area: 'ui',
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
  },
]

describe('epic filters URL sync', () => {
  it('round-trips status and area params', () => {
    const filters = { status: 'active' as const, area: 'rules' }
    const params = filtersToSearchParams(filters)
    expect(params.toString()).toBe('status=active&area=rules')
    expect(filtersFromSearchParams(params)).toEqual(filters)
  })

  it('omits params when filters are cleared', () => {
    expect(filtersToSearchParams({}).toString()).toBe('')
  })
})

describe('applyEpicFilters', () => {
  it('filters by status and area', () => {
    expect(applyEpicFilters(sampleEpics, { status: 'active' })).toHaveLength(1)
    expect(applyEpicFilters(sampleEpics, { area: 'ui' })).toHaveLength(1)
    expect(applyEpicFilters(sampleEpics, {})).toHaveLength(2)
  })
})
