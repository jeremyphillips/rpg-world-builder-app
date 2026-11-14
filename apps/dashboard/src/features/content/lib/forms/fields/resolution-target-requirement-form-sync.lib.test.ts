import { describe, expect, it } from 'vitest'

import {
  reconcileResolutionTargetRequirementRow,
  reconcileResolutionTargetRequirementRows,
} from './resolution-target-requirement-form-sync.lib'

describe('reconcileResolutionTargetRequirementRow', () => {
  it('keeps ordinary condition rows', () => {
    expect(
      reconcileResolutionTargetRequirementRow({
        kind: 'condition',
        presence: 'has',
        ids: ['prone'],
      }),
    ).toEqual({ kind: 'condition', presence: 'has', ids: ['prone'] })
    expect(
      reconcileResolutionTargetRequirementRow({
        kind: 'condition',
        presence: 'lacks',
        ids: ['prone'],
        willing: true,
      }),
    ).toEqual({ kind: 'condition', presence: 'lacks', ids: ['prone'] })
  })

  it('maps condition + willing to any-of or willing-only', () => {
    expect(
      reconcileResolutionTargetRequirementRow({
        kind: 'condition',
        presence: 'has',
        ids: ['grappled'],
        willing: true,
      }),
    ).toEqual({ kind: 'any-of', willing: true, conditionIds: ['grappled'] })
    expect(
      reconcileResolutionTargetRequirementRow({
        kind: 'condition',
        presence: 'has',
        willing: true,
      }),
    ).toEqual({ kind: 'willing' })
  })

  it('round-trips any-of rows through the condition editor', () => {
    expect(
      reconcileResolutionTargetRequirementRow({
        kind: 'any-of',
        willing: true,
        conditionIds: ['grappled', 'restrained'],
      }),
    ).toEqual({ kind: 'any-of', willing: true, conditionIds: ['grappled', 'restrained'] })
    expect(
      reconcileResolutionTargetRequirementRow({
        kind: 'any-of',
        conditionIds: ['grappled'],
      }),
    ).toEqual({ kind: 'condition', presence: 'has', ids: ['grappled'] })
    expect(
      reconcileResolutionTargetRequirementRow({
        kind: 'any-of',
        willing: true,
      }),
    ).toEqual({ kind: 'willing' })
  })

  it('ignores unrelated requirement kinds', () => {
    expect(reconcileResolutionTargetRequirementRow({ kind: 'sight', who: 'actor' })).toEqual({
      kind: 'sight',
      who: 'actor',
    })
  })
})

describe('reconcileResolutionTargetRequirementRows', () => {
  it('returns undefined when nothing changes', () => {
    const rows = [{ kind: 'willing' }]
    expect(reconcileResolutionTargetRequirementRows(rows)).toBeUndefined()
  })

  it('reconciles rows in place order', () => {
    const rows = [
      { kind: 'condition', presence: 'has', ids: ['prone'], willing: true },
      { kind: 'sight', who: 'actor' },
    ]
    expect(reconcileResolutionTargetRequirementRows(rows)).toEqual([
      { kind: 'any-of', willing: true, conditionIds: ['prone'] },
      { kind: 'sight', who: 'actor' },
    ])
  })
})
