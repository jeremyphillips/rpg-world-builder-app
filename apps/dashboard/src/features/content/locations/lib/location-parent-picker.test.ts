import { describe, expect, it } from 'vitest'

import { parentLocationFieldVisibility } from './location-parent-picker'

describe('parentLocationFieldVisibility', () => {
  const visibleWhen = parentLocationFieldVisibility().visibleWhen!

  it('hides the parent field when authoring type is unset or invalid', () => {
    expect(visibleWhen({})).toBe(false)
    expect(visibleWhen({ authoringType: '' })).toBe(false)
    expect(visibleWhen({ authoringType: 'not-a-type' })).toBe(false)
  })

  it('shows the parent field for types that allow a parent', () => {
    expect(visibleWhen({ authoringType: 'region' })).toBe(true)
  })

  it('hides the parent field for types that forbid a parent', () => {
    expect(visibleWhen({ authoringType: 'plane' })).toBe(false)
  })
})
