import { describe, expect, it } from 'vitest'

import { planLinkedEffectAdd } from './linked-effect-plan'
import { stripEffectFromOutcomes } from './outcome-change-plan'
import { nextResolutionEffectId } from './resolution-effect-id-alloc'
import { resolutionEffectIdSchema } from './resolution-effect-id'

describe('nextResolutionEffectId', () => {
  it('allocates an opaque id that is not a kind alias', () => {
    let calls = 0
    const id = nextResolutionEffectId(['damage'], () => (calls++ === 0 ? 'damage' : 'opaque-id'))
    expect(id).toBe('opaque-id')
  })
})

describe('planLinkedEffectAdd', () => {
  it('creates one definition with a full owner reference and a none success reference', () => {
    const plan = planLinkedEffectAdd({
      existingIds: [],
      definition: { kind: 'damage' as const, damageType: 'fire' },
      owner: { result: 'failed-save', amount: 'full' },
      linked: [{ result: 'successful-save', amount: 'none' }],
      createId: () => 'effect-opaque',
    })
    expect(plan.effectId).toBe('effect-opaque')
    expect(plan.definition).toEqual({
      id: 'effect-opaque',
      kind: 'damage',
      damageType: 'fire',
    })
    expect(plan.references).toEqual([
      {
        result: 'failed-save',
        reference: { kind: 'effect-reference', effectId: 'effect-opaque', amount: 'full' },
      },
      {
        result: 'successful-save',
        reference: { kind: 'effect-reference', effectId: 'effect-opaque', amount: 'none' },
      },
    ])
  })

  it('strips every reference to a removed id', () => {
    const keep = resolutionEffectIdSchema.parse('keep')
    const drop = resolutionEffectIdSchema.parse('drop')
    const outcomes = stripEffectFromOutcomes(
      [
        {
          result: 'failed-save',
          effects: [{ kind: 'effect-reference', effectId: keep, amount: 'full' }],
        },
        {
          result: 'successful-save',
          effects: [
            { kind: 'effect-reference', effectId: drop, amount: 'none' },
            { kind: 'effect-reference', effectId: keep, amount: 'half' },
          ],
        },
      ],
      drop,
    )
    expect(outcomes[1]?.effects).toEqual([
      { kind: 'effect-reference', effectId: keep, amount: 'half' },
    ])
  })
})
