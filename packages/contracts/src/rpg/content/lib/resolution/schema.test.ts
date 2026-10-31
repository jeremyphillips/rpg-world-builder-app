import { describe, expect, it } from 'vitest'

import { BURNING_HANDS_RESOLUTION, CURE_WOUNDS_RESOLUTION } from '../../spell/resolution/fixtures'
import { effectResolutionSchema } from './schema'

describe('effectResolutionSchema', () => {
  it('accepts a saving-throw area resolution without spell progression', () => {
    const {
      applicationPattern: _pattern,
      progression: _progression,
      ...envelope
    } = BURNING_HANDS_RESOLUTION
    expect(effectResolutionSchema.parse(envelope)).toEqual(envelope)
  })

  it('defaults omitted target count kind from the count', () => {
    const {
      applicationPattern: _pattern,
      progression: _progression,
      ...envelope
    } = CURE_WOUNDS_RESOLUTION
    if (!envelope.target) throw new Error('fixture target missing')
    const { countKind: _countKind, ...target } = envelope.target
    const parsed = effectResolutionSchema.parse({ ...envelope, target })
    expect(parsed.target?.countKind).toBe('exact')
  })

  it('rejects spell-only attack methods, projectiles, and progression', () => {
    const {
      applicationPattern: _pattern,
      progression: _progression,
      ...envelope
    } = BURNING_HANDS_RESOLUTION

    expect(
      effectResolutionSchema.safeParse({
        ...envelope,
        method: { kind: 'attack', attackType: 'ranged-spell' },
      }).success,
    ).toBe(false)
    expect(
      effectResolutionSchema.safeParse({
        ...envelope,
        applicationPattern: {
          kind: 'projectiles',
          count: { type: 'fixed', value: 1 },
          applicationMode: 'per-projectile',
        },
      }).success,
    ).toBe(false)
    expect(
      effectResolutionSchema.safeParse({
        ...envelope,
        progression: { basis: 'spell-slot-level', tracks: [] },
      }).success,
    ).toBe(false)
  })
})
