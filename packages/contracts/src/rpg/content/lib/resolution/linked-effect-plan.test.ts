import { describe, expect, it } from 'vitest'

import { planLinkedEffectAdd, planLinkedEffectRemove } from './linked-effect-plan'
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

})

describe('planLinkedEffectRemove', () => {
  it('removes the definition and every outcome reference while preserving unrelated rows', () => {
    const keep = resolutionEffectIdSchema.parse('keep')
    const drop = resolutionEffectIdSchema.parse('drop')
    const plan = planLinkedEffectRemove({
      library: [
        { id: drop, kind: 'damage' },
        { id: keep, kind: 'damage' },
      ],
      outcomes: [
        {
          result: 'failed-save',
          effects: [
            { kind: 'effect-reference', effectId: drop, amount: 'full' },
            { kind: 'effect-reference', effectId: keep, amount: 'full' },
          ],
          repeatSave: {
            timing: { participant: 'target', boundary: 'end', which: 'next' },
            successOnRepeatEndsEffect: true,
            secondFailure: {
              effects: [{ kind: 'effect-reference', effectId: drop, amount: 'full' }],
            },
          },
        },
        {
          result: 'successful-save',
          effects: [
            { kind: 'effect-reference', effectId: drop, amount: 'none' },
            { kind: 'effect-reference', effectId: keep, amount: 'half' },
          ],
        },
      ],
      effectId: drop,
    })
    expect(plan.library).toEqual([{ id: keep, kind: 'damage' }])
    expect(plan.outcomes[0]?.effects).toEqual([
      { kind: 'effect-reference', effectId: keep, amount: 'full' },
    ])
    expect(plan.outcomes[0]?.repeatSave?.secondFailure.effects).toEqual([])
    expect(plan.outcomes[1]?.effects).toEqual([
      { kind: 'effect-reference', effectId: keep, amount: 'half' },
    ])
  })
})
