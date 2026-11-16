import { precedingConditionIdsFromEffects } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  normalizeMonsterSaveOutcomes,
  shouldShowSaveRepeatSaveAuthoring,
} from './monster-action-save-outcomes'

const constrictOutcomes = [
  {
    result: 'failed-save' as const,
    effects: [
      {
        kind: 'effect-reference' as const,
        effectId: 'constrict-damage',
        amount: 'full' as const,
      },
      { kind: 'note' as const, description: 'The target is Grappled.' },
    ],
  },
]

describe('monster save outcomes', () => {
  it('keeps a dangling reference, an empty repeat shell, and an unreferenced id', () => {
    const dangling = [
      {
        result: 'failed-save' as const,
        effects: [
          { kind: 'effect-reference' as const, effectId: 'missing', amount: 'full' as const },
        ],
        repeatSave: {
          timing: {
            participant: 'target' as const,
            boundary: 'end' as const,
            which: 'next' as const,
          },
          secondFailure: {},
        },
      },
    ]
    expect(normalizeMonsterSaveOutcomes(dangling)).toEqual(dangling)
    expect(normalizeMonsterSaveOutcomes(constrictOutcomes)).toEqual(constrictOutcomes)
  })

  it('surfaces repeat save authoring for a condition or an existing shell', () => {
    expect(
      shouldShowSaveRepeatSaveAuthoring(
        [{ kind: 'condition', conditionId: 'restrained' }],
        undefined,
      ),
    ).toBe(true)
    expect(
      shouldShowSaveRepeatSaveAuthoring(
        [{ kind: 'note', description: 'Still asleep.' }],
        undefined,
      ),
    ).toBe(false)
    expect(
      shouldShowSaveRepeatSaveAuthoring([], {
        timing: { participant: 'target', boundary: 'end', which: 'next' },
        secondFailure: {},
      }),
    ).toBe(true)
    expect(shouldShowSaveRepeatSaveAuthoring([], {})).toBe(false)
    expect(shouldShowSaveRepeatSaveAuthoring([], undefined)).toBe(false)
  })

  it('collects condition ids for replace-condition options', () => {
    expect(
      precedingConditionIdsFromEffects([
        { kind: 'effect-reference', effectId: 'damage', amount: 'full' },
        { kind: 'condition', conditionId: 'restrained' },
        { kind: 'condition', conditionId: 'restrained' },
      ]),
    ).toEqual(['restrained'])
  })
})
