import { describe, expect, it } from 'vitest'

import { resolveFieldControlSize } from './resolve-field-control-size.lib'

describe('resolveFieldControlSize', () => {
  it('maps comfortable density to md controls', () => {
    expect(resolveFieldControlSize({ density: 'comfortable' })).toBe('md')
  })

  it('maps compact density to sm controls', () => {
    expect(resolveFieldControlSize({ density: 'compact' })).toBe('sm')
  })

  it('prefers override over inherited density', () => {
    expect(resolveFieldControlSize({ density: 'compact', override: 'lg' })).toBe('lg')
  })
})
