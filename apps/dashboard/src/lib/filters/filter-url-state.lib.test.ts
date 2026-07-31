import { describe, expect, it } from 'vitest'
import { createFilterSchema } from '@rpg/ui/filters'
import { createBooleanFilter, createEqualsFilter } from '@rpg/ui/filters'

import { CAMPAIGN_SCOPE_FILTER_URL_KEY, mergeFilterSearchParams } from './filter-url-state.lib'

type DemoRow = { id: string }
type DemoState = { unread?: boolean; sort?: string; campaignId?: string }

const schema = createFilterSchema<DemoRow, DemoState>([
  createBooleanFilter<DemoRow, DemoState, 'unread'>({
    id: 'unread',
    label: 'Unread only',
    getValue: () => true,
    url: { key: 'unread' },
  }),
  createEqualsFilter<DemoRow, DemoState, 'sort', string>({
    id: 'sort',
    label: 'Sort',
    options: [{ value: 'newest', label: 'Newest' }],
    getValue: () => 'newest',
    url: { key: 'sort' },
  }),
  createEqualsFilter<DemoRow, DemoState, 'campaignId', string>({
    id: 'campaignId',
    label: 'Campaign',
    options: [{ value: 'camp-1', label: 'Stormwatch' }],
    getValue: () => 'camp-1',
    url: { key: CAMPAIGN_SCOPE_FILTER_URL_KEY },
  }),
])

describe('mergeFilterSearchParams', () => {
  it('preserves unrelated URL params while replacing filter keys', () => {
    const existing = new URLSearchParams('thread=abc&unread=true&sort=newest')
    const merged = mergeFilterSearchParams(schema, { unread: true }, existing)

    expect(merged.get('thread')).toBe('abc')
    expect(merged.get('unread')).toBe('true')
    expect(merged.has('sort')).toBe(false)
  })

  it('preserves unrelated params when clearing a single filter field', () => {
    const existing = new URLSearchParams('from=conv-1&to=user-2&campaignId=camp-1&unread=true')
    const merged = mergeFilterSearchParams(schema, { unread: true }, existing)

    expect(merged.get('from')).toBe('conv-1')
    expect(merged.get('to')).toBe('user-2')
    expect(merged.has('campaignId')).toBe(false)
    expect(merged.get('unread')).toBe('true')
  })
})
