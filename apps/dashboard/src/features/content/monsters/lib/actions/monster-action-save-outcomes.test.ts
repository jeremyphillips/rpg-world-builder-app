import { RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  countMonsterSaveEffectReferences,
  createMonsterSaveDamageDefinition,
  eligibleExistingSaveEffects,
  isUnusedSaveEffect,
  nextMonsterSaveDamageEffectId,
  normalizeMonsterSaveOutcomes,
  precedingConditionIdsFromEffects,
  shouldShowSaveRepeatSaveAuthoring,
  stripMonsterSaveEffectReferences,
} from './monster-action-save-outcomes'

const fire = createMonsterSaveDamageDefinition(RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID)

const constrictOutcomes = [
  {
    result: 'failed-save' as const,
    effects: [
      {
        kind: 'effect-reference' as const,
        effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
        amount: 'full' as const,
      },
      { kind: 'note' as const, description: 'The target is Grappled.' },
    ],
  },
]

describe('monster save outcomes', () => {
  it('creates a new damage definition and keeps it when one reference is removed', () => {
    const effectId = nextMonsterSaveDamageEffectId([])
    const secondId = nextMonsterSaveDamageEffectId([fire])
    expect(effectId).toBe(RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID)
    expect(secondId).not.toBe(effectId)
    expect(createMonsterSaveDamageDefinition(effectId).kind).toBe('damage')

    const outcomes = [
      {
        result: 'failed-save' as const,
        effects: [{ kind: 'effect-reference' as const, effectId, amount: 'full' as const }],
      },
      {
        result: 'successful-save' as const,
        effects: [{ kind: 'effect-reference' as const, effectId, amount: 'half' as const }],
      },
    ]
    const removed = stripMonsterSaveEffectReferences([outcomes[0]!], effectId)
    expect(removed[0]?.effects).toEqual([])
    expect(outcomes[1]?.effects).toEqual([{ kind: 'effect-reference', effectId, amount: 'half' }])
    expect(countMonsterSaveEffectReferences(outcomes, effectId)).toBe(2)
  })

  it('offers unused definitions, including orphans, and hides ones already on the list', () => {
    const cold = createMonsterSaveDamageDefinition('cold')
    const list = constrictOutcomes[0]?.effects
    expect(eligibleExistingSaveEffects([fire, cold], list).map((effect) => effect.id)).toEqual([
      'cold',
    ])
    expect(isUnusedSaveEffect('cold', constrictOutcomes)).toBe(true)
    expect(isUnusedSaveEffect(RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, constrictOutcomes)).toBe(false)
    expect(eligibleExistingSaveEffects([fire], list)).toEqual([])
  })

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
