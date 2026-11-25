import { describe, expect, it } from 'vitest'

import { materializeOverlayDeltaOntoBaseline } from './resolve-system-overlay.lib'

describe('materializeOverlayDeltaOntoBaseline', () => {
  it('applies only stored scalar sets onto the baseline', () => {
    const baseline = { name: 'Seed', traits: [{ id: 'a', name: 'Trait' }] }
    const mergedBody = { name: 'Patched', traits: [] }
    const stored = { version: 1 as const, revision: 1, set: { name: 'Patched' } }

    const effective = materializeOverlayDeltaOntoBaseline(baseline, mergedBody, stored)
    expect(effective).toEqual({
      name: 'Patched',
      traits: [{ id: 'a', name: 'Trait' }],
    })
  })
})
