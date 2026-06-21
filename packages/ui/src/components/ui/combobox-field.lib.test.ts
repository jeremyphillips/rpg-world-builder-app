import { describe, expect, it } from 'vitest'

import {
  clampHighlightedIndex,
  filterOptions,
  isComboboxOptionDisabled,
  nextHighlightedIndex,
  nextMultiSelection,
  nextSingleSelection,
  normalizeSelected,
  optionMatchesQuery,
  resolveSearchKeyAction,
  resolveTriggerLabel,
} from './combobox-field.lib'

const options = [
  { value: 'dagger', label: 'Dagger' },
  { value: 'fire-bolt', label: 'Fire Bolt', description: 'Cantrip' },
]

describe('combobox-field.lib', () => {
  it('normalizes multi and single values', () => {
    expect(normalizeSelected(true, ['a', 1])).toEqual(['a', '1'])
    expect(normalizeSelected(false, 'a')).toEqual(['a'])
    expect(normalizeSelected(false, '')).toEqual([])
  })

  it('filters options by label, value, and description', () => {
    expect(optionMatchesQuery(options[1]!, 'cantrip')).toBe(true)
    expect(filterOptions(options, 'bolt')).toHaveLength(1)
  })

  it('keeps selected values visible even when they do not match the query', () => {
    expect(filterOptions(options, 'fire', ['dagger'])).toEqual([options[0], options[1]])
  })

  it('includes stale selected values that are missing from options', () => {
    expect(filterOptions(options, 'xyz', ['missing-weapon'])).toEqual([
      { value: 'missing-weapon', label: 'missing-weapon' },
    ])
  })

  it('builds trigger labels', () => {
    expect(resolveTriggerLabel(true, [], 'Choose…', options)).toBe('Choose…')
    expect(resolveTriggerLabel(true, ['a', 'b'], 'Choose…', options)).toBe('2 selected')
    expect(resolveTriggerLabel(false, ['dagger'], 'Choose…', options)).toBe('Dagger')
  })

  it('toggles multi selections with max', () => {
    expect(nextMultiSelection(['a'], 'b', 2)).toEqual(['a', 'b'])
    expect(nextMultiSelection(['a', 'b'], 'c', 2)).toEqual(['a', 'b'])
    expect(nextMultiSelection(['a', 'b'], 'a', undefined)).toEqual(['b'])
  })

  it('toggles single selections', () => {
    expect(nextSingleSelection(['a'], 'b')).toEqual(['b'])
    expect(nextSingleSelection(['a'], 'a')).toEqual([])
  })

  it('clamps and moves highlighted indices', () => {
    expect(clampHighlightedIndex(4, 2)).toBe(1)
    expect(nextHighlightedIndex('next', 0, 3)).toBe(1)
    expect(nextHighlightedIndex('previous', 0, 3)).toBe(0)
  })

  it('resolves search key actions', () => {
    expect(resolveSearchKeyAction('ArrowDown')).toBe('next')
    expect(resolveSearchKeyAction('Tab')).toBeNull()
  })

  it('disables options at max in multi mode', () => {
    expect(isComboboxOptionDisabled(options[0]!, true, true, false)).toBe(true)
    expect(isComboboxOptionDisabled(options[0]!, true, true, true)).toBe(false)
  })
})
