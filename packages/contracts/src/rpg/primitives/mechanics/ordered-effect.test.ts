import { describe, expect, it } from 'vitest'

import { orderedEffectSchema, orderedEffectsSchema } from './ordered-effect'

describe('orderedEffectSchema', () => {
  it('accepts damage, condition with replacement, and note rows', () => {
    const parsed = orderedEffectsSchema.parse([
      {
        kind: 'damage',
        roll: { dice: { count: 1, faces: 6 } },
        damageType: 'fire',
        description: ' while ablaze ',
      },
      {
        kind: 'condition',
        conditionId: 'petrified',
        replacesConditionId: 'restrained',
      },
      { kind: 'note', description: ' Wake note ' },
    ])
    expect(parsed).toEqual([
      {
        kind: 'damage',
        roll: { dice: { count: 1, faces: 6 } },
        damageType: 'fire',
        description: 'while ablaze',
      },
      {
        kind: 'condition',
        conditionId: 'petrified',
        replacesConditionId: 'restrained',
      },
      { kind: 'note', description: 'Wake note' },
    ])
  })

  it('rejects invalid condition and note payloads', () => {
    expect(
      orderedEffectSchema.safeParse({ kind: 'condition', description: 'until the next turn' })
        .success,
    ).toBe(false)
    expect(orderedEffectSchema.safeParse({ kind: 'note', description: '   ' }).success).toBe(false)
    expect(
      orderedEffectSchema.safeParse({
        kind: 'damage',
        roll: { dice: { count: 1 } },
        damageType: 'fire',
      }).success,
    ).toBe(false)
  })
})
