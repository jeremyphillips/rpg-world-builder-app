import { describe, expect, it } from 'vitest'

import { parentLocationFieldVisibility } from './location-parent-picker'

describe('parentLocationFieldVisibility', () => {
  const visibleWhen = parentLocationFieldVisibility().visibleWhen!

  it('hides the parent field when kind is unset or invalid', () => {
    expect(visibleWhen({})).toBe(false)
    expect(visibleWhen({ kind: '' })).toBe(false)
    expect(visibleWhen({ kind: 'not-a-kind' })).toBe(false)
  })

  it('shows the parent field for kinds that allow a parent', () => {
    expect(visibleWhen({ kind: 'region' })).toBe(true)
  })

  it('hides the parent field for kinds that forbid a parent', () => {
    expect(visibleWhen({ kind: 'plane' })).toBe(false)
  })
})
