import { describe, expect, it } from 'vitest'

import {
  getOutcomeEffectAvailability,
  resolveOutcomeApplicationAddState,
} from './resolution-outcome-effect-availability.lib'
import type { ResolutionEffectFormItem } from './resolution-form-schema'

const completeDamage: ResolutionEffectFormItem = {
  id: 'damage',
  kind: 'damage',
  roll: { dice: { count: 1, faces: 10 } },
  damageType: 'force',
}

const incompleteDamage: ResolutionEffectFormItem = {
  id: 'incomplete',
  kind: 'damage',
  roll: {},
  damageType: 'force',
}

describe('getOutcomeEffectAvailability', () => {
  it('marks applied, incomplete, and eligible effects', () => {
    expect(
      getOutcomeEffectAvailability(completeDamage, {
        outcomeResult: 'hit',
        appliedEffectIds: new Set(['damage']),
      }),
    ).toEqual({ status: 'already-applied' })

    expect(
      getOutcomeEffectAvailability(incompleteDamage, {
        outcomeResult: 'hit',
        appliedEffectIds: new Set(),
      }),
    ).toMatchObject({ status: 'incomplete' })

    expect(
      getOutcomeEffectAvailability(completeDamage, {
        outcomeResult: 'successful-save',
        appliedEffectIds: new Set(),
      }),
    ).toEqual({ status: 'eligible', defaultAmount: 'half' })
  })
})

describe('resolveOutcomeApplicationAddState', () => {
  it('returns precise add-state kinds', () => {
    expect(resolveOutcomeApplicationAddState([], { applications: [] }, 'hit')).toEqual({
      kind: 'no-authored-effects',
    })

    expect(
      resolveOutcomeApplicationAddState(
        [completeDamage],
        { applications: [{ effectId: 'damage', amount: 'full' }] },
        'hit',
      ),
    ).toEqual({ kind: 'all-applied' })

    const allIncomplete = resolveOutcomeApplicationAddState(
      [incompleteDamage],
      { applications: [] },
      'hit',
    )
    expect(allIncomplete.kind).toBe('all-incomplete')
    if (allIncomplete.kind === 'all-incomplete') {
      expect(allIncomplete.unavailable).toHaveLength(1)
      expect(allIncomplete.unavailable[0]).toMatchObject({
        id: 'incomplete',
        groupId: 'unavailable',
        disabled: true,
      })
    }

    const ready = resolveOutcomeApplicationAddState(
      [completeDamage, incompleteDamage],
      { applications: [] },
      'hit',
    )
    expect(ready.kind).toBe('ready')
    if (ready.kind === 'ready') {
      expect(ready.eligible).toHaveLength(1)
      expect(ready.unavailable).toHaveLength(1)
    }
  })
})
