import { describe, expect, it } from 'vitest'

import {
  defaultApplicationAmountForOutcome,
  formatResolutionEffectCompletenessMessage,
  getResolutionEffectCompleteness,
} from './resolution-effect-validity.lib'

describe('getResolutionEffectCompleteness', () => {
  it('requires roll and damage type for damage effects', () => {
    expect(
      getResolutionEffectCompleteness({
        id: 'damage',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 8 } },
        damageType: 'fire',
      }),
    ).toEqual({ complete: true })

    expect(
      getResolutionEffectCompleteness({
        id: 'damage',
        kind: 'damage',
        roll: {},
        damageType: 'fire',
      }),
    ).toEqual({ complete: false, missing: ['roll'] })

    expect(
      getResolutionEffectCompleteness({
        id: 'damage',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 8 } },
        damageType: undefined as unknown as 'fire',
      }),
    ).toEqual({ complete: false, missing: ['damageType'] })

    expect(
      getResolutionEffectCompleteness({
        id: 'damage',
        kind: 'damage',
        roll: {},
        damageType: undefined as unknown as 'fire',
      }),
    ).toEqual({ complete: false, missing: ['roll', 'damageType'] })
  })

  it('requires roll for healing and temporary hit point effects', () => {
    expect(
      getResolutionEffectCompleteness({
        id: 'healing',
        kind: 'healing',
        roll: { dice: { count: 2, faces: 8 } },
      }),
    ).toEqual({ complete: true })

    expect(
      getResolutionEffectCompleteness({
        id: 'healing',
        kind: 'healing',
        roll: {},
      }),
    ).toEqual({ complete: false, missing: ['roll'] })
  })
})

describe('formatResolutionEffectCompletenessMessage', () => {
  it('describes missing damage fields', () => {
    const effect = {
      id: 'damage',
      kind: 'damage' as const,
      roll: {},
      damageType: undefined as unknown as 'fire',
    }

    expect(
      formatResolutionEffectCompletenessMessage(effect, {
        complete: false,
        missing: ['roll', 'damageType'],
      }),
    ).toBe('Complete the damage roll and type.')
  })
})

describe('defaultApplicationAmountForOutcome', () => {
  const damageEffect = {
    id: 'damage',
    kind: 'damage' as const,
    roll: { dice: { count: 8, faces: 6 as const } },
    damageType: 'fire' as const,
  }

  it('defaults to half on successful save for partial-capable kinds', () => {
    expect(defaultApplicationAmountForOutcome(damageEffect, 'successful-save')).toBe('half')
  })

  it('defaults to full for other outcomes and non-partial kinds', () => {
    expect(defaultApplicationAmountForOutcome(damageEffect, 'failed-save')).toBe('full')
    expect(
      defaultApplicationAmountForOutcome(
        {
          id: 'healing',
          kind: 'healing',
          roll: { dice: { count: 2, faces: 8 } },
        },
        'successful-save',
      ),
    ).toBe('full')
  })
})
