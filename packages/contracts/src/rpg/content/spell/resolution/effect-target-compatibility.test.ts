import { describe, expect, it } from 'vitest'

import {
  getEffectTargetAvailability,
  isCreatureOnlyResolutionEffectKind,
  isEffectKindAllowedForTarget,
} from './effect-target-compatibility'

describe('isCreatureOnlyResolutionEffectKind', () => {
  it('identifies healing and temporary hit points', () => {
    expect(isCreatureOnlyResolutionEffectKind('healing')).toBe(true)
    expect(isCreatureOnlyResolutionEffectKind('temporary-hit-points')).toBe(true)
    expect(isCreatureOnlyResolutionEffectKind('damage')).toBe(false)
  })
})

describe('isEffectKindAllowedForTarget', () => {
  it('allows creature-only effects for creature targets and self proximity', () => {
    expect(
      isEffectKindAllowedForTarget('healing', {
        proximityKind: 'touch',
        targetKind: 'creature',
        targetCount: 1,
      }),
    ).toBe(true)

    expect(
      isEffectKindAllowedForTarget('healing', {
        proximityKind: 'self',
        targetKind: 'creature',
        targetCount: 1,
      }),
    ).toBe(true)
  })

  it('disallows creature-only effects for object and creature-or-object targets', () => {
    expect(
      isEffectKindAllowedForTarget('healing', {
        proximityKind: 'touch',
        targetKind: 'object',
        targetCount: 1,
      }),
    ).toBe(false)

    expect(
      isEffectKindAllowedForTarget('temporary-hit-points', {
        proximityKind: 'distance',
        targetKind: 'creature-or-object',
        targetCount: 1,
      }),
    ).toBe(false)
  })

  it('allows damage for any target kind', () => {
    expect(
      isEffectKindAllowedForTarget('damage', {
        proximityKind: 'touch',
        targetKind: 'object',
        targetCount: 1,
      }),
    ).toBe(true)
  })
})

describe('getEffectTargetAvailability', () => {
  it('returns structured reason for incompatible target', () => {
    const availability = getEffectTargetAvailability(
      { proximityKind: 'touch', targetKind: 'object', targetCount: 1 },
      'healing',
    )

    expect(availability.allowed).toBe(false)
    expect(availability.reason).toEqual({
      code: 'effect-kind-incompatible-with-target',
      kind: 'healing',
      targetKind: 'object',
    })
  })
})
