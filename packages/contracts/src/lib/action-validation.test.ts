import { describe, expect, it } from 'vitest'

import {
  ACTION_PLAN_UNCHANGED_REASONS,
  countPlanTargetsByStatus,
  createBlockedActionTarget,
  createEligibleActionTarget,
  createSingleTargetValidationResult,
  getBlockedActionTargets,
  getDistinctUnchangedReasons,
  getEligibleActionTargets,
  getUnchangedPlanTargets,
  getWouldChangePlanTargets,
  groupUnchangedPlanTargetsByReason,
  hasActionValidationBlockers,
  hasApplyOperationalFailures,
  hasHomogeneousUnchangedReason,
  mergeApplyBlockedOutcomesIntoValidation,
  partitionApplyOutcomes,
  type ActionApplyOutcome,
  type ActionPlanResult,
  type ActionValidationResult,
} from './action-validation'

describe('action validation helpers', () => {
  it('treats single-target validation as a one-element result', () => {
    const result = createSingleTargetValidationResult(
      createEligibleActionTarget({ targetId: 'a', targetName: 'Alpha' }),
    )

    expect(result.targets).toHaveLength(1)
    expect(result.targets[0]?.status).toBe('eligible')
  })

  it('never puts unchanged on validation results', () => {
    const result: ActionValidationResult<{ code: string }> = {
      targets: [
        createEligibleActionTarget({ targetId: 'a', targetName: 'Alpha' }),
        createBlockedActionTarget({ targetId: 'b', targetName: 'Beta' }, [{ code: 'blocked' }]),
      ],
    }

    expect(getEligibleActionTargets(result)).toHaveLength(1)
    expect(getBlockedActionTargets(result)).toHaveLength(1)
    expect(hasActionValidationBlockers(result)).toBe(true)
  })

  it('partitions plan targets separately from validation', () => {
    const plan: ActionPlanResult = {
      targets: [
        { status: 'wouldChange', targetId: 'a', targetName: 'Alpha' },
        {
          status: 'unchanged',
          targetId: 'b',
          targetName: 'Beta',
          reason: ACTION_PLAN_UNCHANGED_REASONS.already_matches,
        },
      ],
    }

    expect(getWouldChangePlanTargets(plan)).toHaveLength(1)
    expect(getUnchangedPlanTargets(plan)).toHaveLength(1)
    expect(countPlanTargetsByStatus(plan)).toEqual({ wouldChange: 1, unchanged: 1 })
  })

  it('groups unchanged plan targets by reason', () => {
    const plan: ActionPlanResult = {
      targets: [
        {
          status: 'unchanged',
          targetId: 'a',
          targetName: 'Alpha',
          reason: ACTION_PLAN_UNCHANGED_REASONS.already_available,
        },
        {
          status: 'unchanged',
          targetId: 'b',
          targetName: 'Beta',
          reason: ACTION_PLAN_UNCHANGED_REASONS.already_available,
        },
        {
          status: 'unchanged',
          targetId: 'c',
          targetName: 'Gamma',
          reason: ACTION_PLAN_UNCHANGED_REASONS.already_unavailable,
        },
      ],
    }

    expect(getDistinctUnchangedReasons(plan)).toEqual([
      ACTION_PLAN_UNCHANGED_REASONS.already_available,
      ACTION_PLAN_UNCHANGED_REASONS.already_unavailable,
    ])
    expect(hasHomogeneousUnchangedReason(plan)).toBe(false)
    expect(
      groupUnchangedPlanTargetsByReason(plan).get(ACTION_PLAN_UNCHANGED_REASONS.already_available),
    ).toHaveLength(2)
  })

  it('requires structured failure payloads on failed apply outcomes', () => {
    const outcomes: ActionApplyOutcome<never>[] = [
      { status: 'updated', targetId: 'a' },
      {
        status: 'failed',
        targetId: 'b',
        failure: { code: 'network', message: 'Request failed.' },
      },
    ]

    expect(partitionApplyOutcomes(outcomes)).toMatchObject({
      updated: [{ targetId: 'a' }],
      failed: [{ targetId: 'b', failure: { code: 'network' } }],
    })
    expect(hasApplyOperationalFailures(outcomes)).toBe(true)
  })

  it('merges apply-time blocked outcomes back into validation results', () => {
    const validation = createSingleTargetValidationResult(
      createEligibleActionTarget({ targetId: 'a', targetName: 'Alpha' }),
    )

    const merged = mergeApplyBlockedOutcomesIntoValidation(validation, [
      {
        status: 'blocked',
        targetId: 'a',
        blockers: [{ kind: 'rule', code: 'race', message: 'Blocked by race.' }],
      },
    ])

    expect(getBlockedActionTargets(merged)).toHaveLength(1)
  })
})
