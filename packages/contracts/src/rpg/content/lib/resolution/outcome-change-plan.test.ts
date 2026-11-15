import { describe, expect, it } from 'vitest'

import { planOutcomeMethodChange } from './outcome-change-plan'
import type { ResolutionSelectionState } from './selection-types'

function attackState(overrides: Partial<ResolutionSelectionState> = {}): ResolutionSelectionState {
  return {
    proximityKind: 'distance',
    proximityDistanceFt: 120,
    targetKind: 'creature-or-object',
    targetCount: 1,
    methodKind: 'attack',
    attackType: 'ranged-spell',
    applicationPatternKind: 'none',
    effects: [{ id: 'damage', kind: 'damage' }],
    outcomes: [
      {
        result: 'hit',
        applications: [{ effectId: 'damage', amount: 'full' }],
      },
      {
        result: 'miss',
        applications: [],
        note: 'Creates a cloud at the point of impact.',
      },
    ],
    ...overrides,
  }
}

function saveState(overrides: Partial<ResolutionSelectionState> = {}): ResolutionSelectionState {
  return {
    proximityKind: 'distance',
    proximityDistanceFt: 60,
    targetKind: 'creature',
    targetCount: 1,
    methodKind: 'saving-throw',
    saveAbility: 'con',
    applicationPatternKind: 'none',
    effects: [{ id: 'damage', kind: 'damage' }],
    outcomes: [
      {
        result: 'failed-save',
        applications: [{ effectId: 'damage', amount: 'full' }],
        effects: [{ kind: 'condition', conditionId: 'restrained' }],
        repeatSave: {
          timing: { participant: 'target', boundary: 'end', which: 'next' },
          successOnRepeatEndsEffect: true,
          secondFailure: {
            effects: [
              {
                kind: 'condition',
                conditionId: 'petrified',
                replacesConditionId: 'restrained',
              },
            ],
          },
        },
      },
      { result: 'successful-save', applications: [{ effectId: 'damage', amount: 'half' }] },
    ],
    ...overrides,
  }
}

describe('planOutcomeMethodChange', () => {
  it('maps hit to failed-save when switching to saving throw', () => {
    const plan = planOutcomeMethodChange(attackState(), 'saving-throw')

    expect(plan.discardedBranches).toEqual(['miss'])
    expect(plan.mappedOutcomes.find((outcome) => outcome.result === 'failed-save')).toMatchObject({
      result: 'failed-save',
      applications: [{ effectId: 'damage', amount: 'full' }],
    })
    expect(plan.mappedOutcomes.find((outcome) => outcome.result === 'successful-save')).toEqual({
      result: 'successful-save',
      applications: [],
    })
  })

  it('preserves attack outcomes when switching melee to ranged', () => {
    const plan = planOutcomeMethodChange(
      attackState({ attackType: 'melee-spell', proximityKind: 'reach' }),
      'ranged-spell',
    )

    expect(plan.discardedBranches).toEqual([])
    expect(plan.mappedOutcomes).toEqual(attackState().outcomes)
  })

  it('keeps ordered effects and repeat save when remapping failed-save to hit', () => {
    const plan = planOutcomeMethodChange(saveState(), 'ranged-spell')

    expect(plan.mappedOutcomes.find((outcome) => outcome.result === 'hit')).toMatchObject({
      result: 'hit',
      effects: [{ kind: 'condition', conditionId: 'restrained' }],
      repeatSave: {
        timing: { participant: 'target', boundary: 'end', which: 'next' },
        secondFailure: {
          effects: [
            {
              kind: 'condition',
              conditionId: 'petrified',
              replacesConditionId: 'restrained',
            },
          ],
        },
      },
    })
  })
})
