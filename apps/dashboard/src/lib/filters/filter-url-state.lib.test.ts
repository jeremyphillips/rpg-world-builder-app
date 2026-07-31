import { describe, expect, it } from 'vitest'
import { createFilterSchema } from '@rpg/ui/filters'
import { createBooleanFilter, createEqualsFilter } from '@rpg/ui/filters'

import { mergeFilterSearchParams } from './filter-url-state.lib'

type DemoRow = { id: string }
type DemoState = { unread?: boolean; sort?: string }

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
])

describe('mergeFilterSearchParams', () => {
  it('preserves unrelated URL params while replacing filter keys', () => {
    const existing = new URLSearchParams('thread=abc&unread=true&sort=newest')
    const merged = mergeFilterSearchParams(schema, { unread: true }, existing)

    expect(merged.get('thread')).toBe('abc')
    expect(merged.get('unread')).toBe('true')
    expect(merged.has('sort')).toBe(false)
  })
})
