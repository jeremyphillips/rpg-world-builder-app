import { describe, expect, it } from 'vitest'

import { deriveDefaultEffectRecipient, isResolutionTargetConfigured } from './effect-context'
import type { ResolutionSelectionState } from './selection-types'

const distanceAttackState: ResolutionSelectionState = {
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

describe('deriveDefaultEffectRecipient', () => {
  it('returns self for self proximity', () => {
    expect(
      deriveDefaultEffectRecipient({
        proximityKind: 'self',
        targetKind: 'creature',
        targetCount: 1,
      }),
    ).toBe('self')
  })

  it('returns target when external target is configured', () => {
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
