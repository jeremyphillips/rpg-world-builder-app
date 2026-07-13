import { describe, expect, it } from 'vitest'

import {
  normalizeSpellEffects,
  spellEffectsFromFormValues,
  spellEffectsToFormValues,
} from './effect-form-values'

describe('normalizeSpellEffects', () => {
  it('normalizes representative effect fixtures', () => {
    const fireBolt = normalizeSpellEffects([
      {
        id: 'fx-1',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 10 } },
        damageType: 'fire',
      },
    ])
    expect(fireBolt[0]).toMatchObject({ kind: 'damage', damageType: 'fire' })

    const falseLife = normalizeSpellEffects([
      {
        id: 'fx-2',
        kind: 'temporary-hit-points',
        roll: { dice: { count: 2, faces: 4 }, flatOperator: '+', flatAmount: 4 },
      },
    ])
    expect(falseLife[0]?.kind).toBe('temporary-hit-points')
    if (falseLife[0]?.kind === 'temporary-hit-points') {
      expect(falseLife[0].roll).toEqual({ dice: { count: 2, faces: 4 }, flat: 4 })
    }
  })

  it('strips incompatible fields when kind changes', () => {
    const normalized = normalizeSpellEffects([
      {
        id: 'fx-3',
        kind: 'projectile-count',
        count: 3,
        label: 'darts',
        roll: { dice: { count: 1, faces: 4 }, flatOperator: '+', flatAmount: 1 },
        damageType: 'force',
      },
    ])

    expect(normalized).toHaveLength(1)
    expect(normalized[0]).toMatchObject({
      kind: 'projectile-count',
      count: 3,
      label: 'darts',
    })
    expect('roll' in (normalized[0] ?? {})).toBe(false)
    expect('damageType' in (normalized[0] ?? {})).toBe(false)
  })

  it('does not imply projectile-to-damage relationships for Magic Missile', () => {
    const normalized = normalizeSpellEffects([
      {
        id: 'fx-count',
        kind: 'projectile-count',
        count: 3,
        label: 'darts',
      },
      {
        id: 'fx-damage',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 4 }, flatOperator: '+', flatAmount: 1 },
        damageType: 'force',
      },
    ])

    expect(spellEffectsFromFormValues(normalized.map((effect) => ({ ...effect })))).toHaveLength(2)
  })
})

describe('spellEffectsToFormValues', () => {
  it('round-trips contract effects to form rows', () => {
    const effects = [
      {
        id: 'fx-1',
        kind: 'healing' as const,
        roll: { dice: { count: 2, faces: 8 as const } },
      },
    ]
    expect(spellEffectsToFormValues(effects)).toEqual([
      {
        id: 'fx-1',
        kind: 'healing',
        roll: { dice: { count: 2, faces: 8 } },
      },
    ])
    expect(spellEffectsFromFormValues(spellEffectsToFormValues(effects))).toEqual(effects)
  })

  it('splits signed flat into operator and amount for form rows', () => {
    expect(
      spellEffectsToFormValues([
        {
          id: 'fx-2',
          kind: 'temporary-hit-points',
          roll: { dice: { count: 2, faces: 4 }, flat: 4 },
        },
      ]),
    ).toEqual([
      {
        id: 'fx-2',
        kind: 'temporary-hit-points',
        roll: { dice: { count: 2, faces: 4 }, flatOperator: '+', flatAmount: 4 },
      },
    ])
  })
})
