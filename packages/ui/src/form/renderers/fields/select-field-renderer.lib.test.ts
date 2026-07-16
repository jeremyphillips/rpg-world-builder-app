import { describe, expect, it } from 'vitest'

import { normalizedSelectFieldValue, soleSelectOptionValue } from './select-field-renderer.lib'

describe('select-field-renderer.lib', () => {
  it('returns the sole option value when only one option exists', () => {
    expect(soleSelectOptionValue([{ value: 'full', label: 'Full effect' }])).toBe('full')
    expect(soleSelectOptionValue([])).toBeUndefined()
  })

  it('normalizes select values for the editable trigger', () => {
    expect(normalizedSelectFieldValue('half')).toBe('half')
    expect(normalizedSelectFieldValue('')).toBe('')
    expect(normalizedSelectFieldValue(undefined)).toBe('')
  })
})
