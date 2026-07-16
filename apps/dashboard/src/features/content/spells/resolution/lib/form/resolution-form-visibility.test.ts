import { describe, expect, it } from 'vitest'

import {
  isResolutionFormConfigured,
  visibleWhenNoResolution,
  visibleWhenResolutionConfigured,
} from './resolution-form-visibility'

describe('resolution form visibility', () => {
  it('treats a hydrated resolution object as configured', () => {
    expect(
      isResolutionFormConfigured({
        resolution: {
          methodKind: 'attack',
          attackType: 'ranged-spell',
        },
      }),
    ).toBe(true)
    expect(
      visibleWhenResolutionConfigured().visibleWhen({ resolution: { methodKind: 'attack' } }),
    ).toBe(true)
    expect(visibleWhenNoResolution().visibleWhen({ resolution: { methodKind: 'attack' } })).toBe(
      false,
    )
  })

  it('treats nested methodKind defaults as configured', () => {
    expect(isResolutionFormConfigured({ 'resolution.methodKind': 'saving-throw' })).toBe(true)
  })

  it('treats absent resolution as unmodeled', () => {
    expect(isResolutionFormConfigured({})).toBe(false)
    expect(visibleWhenNoResolution().visibleWhen({})).toBe(true)
    expect(visibleWhenResolutionConfigured().visibleWhen({})).toBe(false)
  })
})
