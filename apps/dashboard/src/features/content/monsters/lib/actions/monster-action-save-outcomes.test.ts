import { RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  monsterSaveOutcomeAmount,
  normalizeMonsterSaveOutcomes,
  precedingConditionIdsFromEffects,
  shouldShowSaveRepeatSaveAuthoring,
  withMonsterSaveOutcomeAmount,
} from './monster-action-save-outcomes'

const constrictOutcomes = [
  {
    result: 'failed-save' as const,
    applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' as const }],
    effects: [{ kind: 'note' as const, description: 'The target is Grappled.' }],
  },
]

describe('monster save outcomes', () => {
  it('adds a successful-save slot with the damage effect when an amount is chosen', () => {
    const next = withMonsterSaveOutcomeAmount(
      constrictOutcomes,
      'half',
      RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
    )

    expect(next.map((outcome) => outcome.result)).toEqual(['failed-save', 'successful-save'])
    expect(next[1]).toEqual({
      result: 'successful-save',
      applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'half' }],
    })
    expect(monsterSaveOutcomeAmount(next)).toBe('half')
  })

  it('migrates legacy failed-save notes into ordered note effects', () => {
    const legacy = [
      {
        result: 'failed-save' as const,
        applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' as const }],
        note: 'The target is Grappled (escape DC equals the save DC).',
      },
    ]
    expect(normalizeMonsterSaveOutcomes(legacy)).toEqual([
      {
        result: 'failed-save',
        applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
        effects: [
          {
            kind: 'note',
            description: 'The target is Grappled (escape DC equals the save DC).',
          },
        ],
      },
    ])
  })

  it('stores a chosen successful-save amount and drops an empty one', () => {
    const chosen = withMonsterSaveOutcomeAmount(
      constrictOutcomes,
      'full',
      RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
    )
    expect(normalizeMonsterSaveOutcomes(chosen)).toHaveLength(2)
    expect(normalizeMonsterSaveOutcomes(constrictOutcomes)).toEqual(constrictOutcomes)
  })

  it('surfaces repeat save authoring for condition-first failures', () => {
    expect(
      shouldShowSaveRepeatSaveAuthoring(
        [{ kind: 'condition', conditionId: 'restrained' }],
        undefined,
      ),
    ).toBe(true)
    expect(
      shouldShowSaveRepeatSaveAuthoring([], {
        timing: { participant: 'target', boundary: 'end', which: 'next' },
        secondFailure: { effects: [{ kind: 'condition', conditionId: 'petrified' }] },
      }),
    ).toBe(true)
    expect(shouldShowSaveRepeatSaveAuthoring([], undefined)).toBe(false)
  })

  it('collects condition ids for replace-condition options', () => {
    expect(
      precedingConditionIdsFromEffects([
        { kind: 'damage', roll: { dice: { count: 1, faces: 6 } } },
        { kind: 'condition', conditionId: 'restrained' },
        { kind: 'condition', conditionId: 'restrained' },
      ]),
    ).toEqual(['restrained'])
  })

  it('preserves outcome effects and strips incomplete repeat save shells', () => {
    const withEffects = [
      {
        result: 'failed-save' as const,
        applications: [],
        effects: [{ kind: 'condition' as const, conditionId: 'restrained' as const }],
        repeatSave: {
          timing: {
            participant: 'target' as const,
            boundary: 'end' as const,
            which: 'next' as const,
          },
          secondFailure: {},
        },
      },
      {
        result: 'failed-or-successful-save' as const,
        applications: [],
        note: 'Environmental rider.',
      },
    ]

    expect(normalizeMonsterSaveOutcomes(withEffects)).toEqual([
      {
        result: 'failed-save',
        applications: [],
        effects: [{ kind: 'condition', conditionId: 'restrained' }],
      },
      {
        result: 'failed-or-successful-save',
        applications: [],
        note: 'Environmental rider.',
      },
    ])
  })
})
