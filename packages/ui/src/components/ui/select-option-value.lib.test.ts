import { describe, expect, it } from 'vitest'

import {
  decodeSelectOptionValue,
  encodeSelectOptionValue,
  encodeStoredSelectOptionValue,
  resolveSelectOptionChange,
  selectOptionValuesEqual,
} from './select-option-value.lib'

describe('select-option-value.lib', () => {
  it('encodes numbers and strings with distinct prefixes', () => {
    expect(encodeSelectOptionValue(30)).toBe('n:30')
    expect(encodeSelectOptionValue('30')).toBe('s:30')
    expect(encodeSelectOptionValue('n:30')).toBe('s:n:30')
  })

  it('decodes encoded values back to the original type', () => {
    expect(decodeSelectOptionValue('n:30')).toBe(30)
    expect(decodeSelectOptionValue('s:30')).toBe('30')
    expect(decodeSelectOptionValue('s:n:30')).toBe('n:30')
    expect(decodeSelectOptionValue('invalid')).toBeUndefined()
  })

  it('distinguishes numeric 30 from string "30" when resolving changes', () => {
    const numericOptions = [{ value: 30 as const, label: '30' }]
    const stringOptions = [{ value: '30' as const, label: 'Thirty' }]

    expect(resolveSelectOptionChange('n:30', numericOptions)).toBe(30)
    expect(resolveSelectOptionChange('s:30', stringOptions)).toBe('30')
    expect(resolveSelectOptionChange('s:30', numericOptions)).toBeUndefined()
    expect(resolveSelectOptionChange('n:30', stringOptions)).toBeUndefined()
  })

  it('encodes stored values only when they match a known option', () => {
    const options = [{ value: 30, label: '30' }]
    expect(encodeStoredSelectOptionValue(30, options)).toBe('n:30')
    expect(encodeStoredSelectOptionValue('30', options)).toBe('n:30')
    expect(encodeStoredSelectOptionValue(undefined, options)).toBeUndefined()
  })

  it('coerces numeric stored values against string numeric options for display', () => {
    const options = [{ value: '30', label: '30' }]
    expect(encodeStoredSelectOptionValue(30, options)).toBe('s:30')
  })

  it('compares option values with strict typing', () => {
    expect(selectOptionValuesEqual(30, 30)).toBe(true)
    expect(selectOptionValuesEqual(30, '30')).toBe(false)
    expect(selectOptionValuesEqual('30', '30')).toBe(true)
  })
})
