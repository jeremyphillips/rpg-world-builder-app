import { describe, expect, it } from 'vitest'

import { attackOnHitSchema } from './attack-on-hit'

describe('attackOnHitSchema', () => {
  it('keeps ordered damage, condition, and note effects', () => {
    const parsed = attackOnHitSchema.parse({
      effects: [
        {
          kind: 'damage',
          roll: { dice: { count: 1, faces: 6 } },
          damageType: 'fire',
          description: ' while ablaze ',
        },
        {
          kind: 'condition',
          conditionId: 'paralyzed',
          description: " until the start of the lich's next turn ",
        },
        { kind: 'note', description: ' The target starts burning ' },
      ],
    })
    expect(parsed.effects).toEqual([
      {
        kind: 'damage',
        roll: { dice: { count: 1, faces: 6 } },
        damageType: 'fire',
        description: 'while ablaze',
      },
      {
        kind: 'condition',
        conditionId: 'paralyzed',
        description: "until the start of the lich's next turn",
      },
      { kind: 'note', description: 'The target starts burning' },
    ])
  })

  it('rejects a missing condition and a blank note', () => {
    expect(
      attackOnHitSchema.safeParse({
        effects: [{ kind: 'condition', description: 'until the next turn' }],
      }).success,
    ).toBe(false)
    expect(
      attackOnHitSchema.safeParse({ effects: [{ kind: 'note', description: '   ' }] }).success,
    ).toBe(false)
    expect(
      attackOnHitSchema.safeParse({
        effects: [{ kind: 'damage', roll: { dice: { count: 1 } }, damageType: 'fire' }],
      }).success,
    ).toBe(false)
    expect(
      attackOnHitSchema.safeParse({
        effects: [
          {
            kind: 'damage',
            roll: { dice: { count: 1, faces: 6 } },
            damageType: 'fire',
            description: '   ',
          },
        ],
      }).success,
    ).toBe(false)
  })
})
