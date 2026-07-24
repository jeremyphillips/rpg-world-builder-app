import { describe, expect, it } from 'vitest'

import { createEqualsFilter } from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import {
  normalizeFilterSelectChange,
  resolveAdvancedPanelColumns,
  resolveFilterSelectValue,
} from './filter-bar.lib'
import { FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'

type TestState = {
  status?: 'draft' | 'published'
}

const schema = createFilterSchema([
  createEqualsFilter<{ status: string }, TestState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status as 'draft' | 'published',
    showAllOption: true,
  }),
])

describe('filter-bar.lib', () => {
  const field = schema.fields[0] as Extract<(typeof schema.fields)[number], { type: 'select' }>
  const selectLike = {
    ...field,
    options: field.options as { value: string; label: string }[],
  }

  it('uses the all sentinel when no value is set and showAllOption is enabled', () => {
    expect(resolveFilterSelectValue(selectLike, undefined, undefined)).toBe(FILTER_SELECT_ALL_VALUE)
  })

  it('prefers raw and effective values over the all sentinel', () => {
    expect(resolveFilterSelectValue(selectLike, 'draft', undefined)).toBe('draft')
    expect(resolveFilterSelectValue(selectLike, undefined, 'published')).toBe('published')
  })

  it('normalizes the all sentinel to undefined', () => {
    expect(normalizeFilterSelectChange(selectLike, FILTER_SELECT_ALL_VALUE)).toBeUndefined()
    expect(normalizeFilterSelectChange(selectLike, 'draft')).toBe('draft')
  })

  it('resolves advanced panel column counts', () => {
    expect(resolveAdvancedPanelColumns(1)).toBe(1)
    expect(resolveAdvancedPanelColumns(2)).toBe(2)
    expect(resolveAdvancedPanelColumns(3)).toBe(3)
    expect(resolveAdvancedPanelColumns(5)).toBe(4)
  })
})
