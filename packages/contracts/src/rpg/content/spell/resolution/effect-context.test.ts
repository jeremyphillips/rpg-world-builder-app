import { describe, expect, it } from 'vitest'

import {
  BURNING_HANDS_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  FIREBALL_RESOLUTION,
} from './fixtures'
import {
  deriveDefaultEffectRecipient,
  deriveEffectRecipientFromResolution,
  isResolutionTargetConfigured,
} from './effect-context'
import type { ResolutionSelectionState } from './selection-types'

const distanceAttackState: ResolutionSelectionState = {
  selectionMode: 'targets',
  proximityKind: 'distance',
  proximityDistanceFt: 120,
  targetKind: 'creature-or-object',
  targetCount: 1,
  methodKind: 'attack',
  attackType: 'ranged-spell',
  applicationPatternKind: 'projectiles',
  projectileCount: 3,
  effects: [{ id: 'damage', kind: 'damage' }],
}

describe('deriveEffectRecipientFromResolution', () => {
  it('returns self for self mode without area', () => {
    expect(deriveEffectRecipientFromResolution(FALSE_LIFE_RESOLUTION)).toBe('self')
  })

  it('returns area for self mode with area', () => {
    expect(deriveEffectRecipientFromResolution(BURNING_HANDS_RESOLUTION)).toBe('area')
  })

  it('returns area for point mode with area', () => {
    expect(deriveEffectRecipientFromResolution(FIREBALL_RESOLUTION)).toBe('area')
  })

  it('returns target for targets mode', () => {
    expect(deriveEffectRecipientFromResolution(CURE_WOUNDS_RESOLUTION)).toBe('target')
  })
})

describe('deriveDefaultEffectRecipient', () => {
  it('uses selectionMode and area when present', () => {
    expect(
      deriveDefaultEffectRecipient({
        selectionMode: 'self',
        hasAreaOfEffect: true,
      }),
    ).toBe('area')

    expect(
      deriveDefaultEffectRecipient({
        selectionMode: 'self',
        hasAreaOfEffect: false,
      }),
    ).toBe('self')
  })

  it('returns target for legacy external target state', () => {
    expect(
      deriveDefaultEffectRecipient({
        proximityKind: 'touch',
        targetKind: 'creature',
        targetCount: 1,
      }),
    ).toBe('target')
  })

  it('returns generic when target is incomplete', () => {
    expect(deriveDefaultEffectRecipient({ proximityKind: 'touch' })).toBe('generic')
  })
})

describe('isResolutionTargetConfigured', () => {
  it('is false for self proximity', () => {
    expect(
      isResolutionTargetConfigured({
        proximityKind: 'self',
        targetKind: 'creature',
        targetCount: 1,
      }),
    ).toBe(false)
  })

  it('is true for touch with kind and count', () => {
    expect(
      isResolutionTargetConfigured({
        proximityKind: 'touch',
        targetKind: 'creature',
        targetCount: 1,
      }),
    ).toBe(true)
  })
})

describe('recipient context fixture', () => {
  it('models distance attack target as target recipient', () => {
    expect(deriveDefaultEffectRecipient(distanceAttackState)).toBe('target')
  })
})
