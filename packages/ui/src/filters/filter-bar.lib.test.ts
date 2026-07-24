import { describe, expect, it } from 'vitest'

import { createEqualsFilter } from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import {
  normalizeFilterSelectChange,
  resolveFilterControlSize,
  resolveFilterSelectValue,
  resolveSelectCurrentValue,
  shouldSkipFilterSelectChange,
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

  it('maps filter density to control size', () => {
    expect(resolveFilterControlSize('compact')).toBe('sm')
    expect(resolveFilterControlSize('comfortable')).toBe('md')
    expect(resolveFilterControlSize()).toBe('sm')
  })

  it('resolves the current select value from raw and effective state', () => {
    expect(resolveSelectCurrentValue('draft', 'published')).toBe('draft')
    expect(resolveSelectCurrentValue(undefined, 'published')).toBe('published')
    expect(resolveSelectCurrentValue('', 'published')).toBe('published')
    expect(resolveSelectCurrentValue(undefined, undefined)).toBeUndefined()
  })

  it('skips duplicate select changes when normalized value is unchanged', () => {
    expect(shouldSkipFilterSelectChange('draft', 'draft', undefined)).toBe(true)
    expect(shouldSkipFilterSelectChange(undefined, undefined, undefined)).toBe(true)
    expect(shouldSkipFilterSelectChange('published', 'draft', undefined)).toBe(false)
  })
})
