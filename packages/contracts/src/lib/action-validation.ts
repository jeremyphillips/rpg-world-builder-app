/** Base structured operational failure — domains may extend via intersection types. */
export type ActionTargetFailure = {
  code: string
  message: string
}

/** Validation only — change detection is not a validation status. */
export type ActionTargetResult<TBlocker> =
  | { status: 'eligible'; targetId: string; targetName: string }
  | { status: 'blocked'; targetId: string; targetName: string; blockers: TBlocker[] }

export type ActionValidationResult<TBlocker> = {
  targets: ActionTargetResult<TBlocker>[]
}

/**
 * Planning / change detection — separate from validation.
 * Built when comparing current record state to requested operations.
 */
export type ActionPlanTarget =
  | { status: 'wouldChange'; targetId: string; targetName: string }
  | { status: 'unchanged'; targetId: string; targetName: string }

export type ActionPlanResult = {
  targets: ActionPlanTarget[]
}

/** Structured operational failure — never a bare targetId. */
export type ActionApplyOutcome<
  TBlocker,
  TFailure extends ActionTargetFailure = ActionTargetFailure,
> =
  | { status: 'updated'; targetId: string }
  | { status: 'blocked'; targetId: string; blockers: TBlocker[] }
  | { status: 'failed'; targetId: string; failure: TFailure }
  | { status: 'unchanged'; targetId: string }

export type ActionTargetIdentity = {
  targetId: string
  targetName: string
}

export function createEligibleActionTarget(
  target: ActionTargetIdentity,
): ActionTargetResult<never> {
  return {
    status: 'eligible',
    targetId: target.targetId,
    targetName: target.targetName,
  }
}

export function createBlockedActionTarget<TBlocker>(
  target: ActionTargetIdentity,
  blockers: readonly TBlocker[],
): ActionTargetResult<TBlocker> {
  return {
    status: 'blocked',
    targetId: target.targetId,
    targetName: target.targetName,
    blockers: [...blockers],
  }
}

export function createActionValidationResult<TBlocker>(
  targets: readonly ActionTargetResult<TBlocker>[],
): ActionValidationResult<TBlocker> {
  return { targets: [...targets] }
}

export function createSingleTargetValidationResult<TBlocker>(
  target: ActionTargetResult<TBlocker>,
): ActionValidationResult<TBlocker> {
  return { targets: [target] }
}

export function getEligibleActionTargets<TBlocker>(
  result: ActionValidationResult<TBlocker>,
): ActionTargetResult<TBlocker>[] {
  return result.targets.filter(
    (target): target is Extract<ActionTargetResult<TBlocker>, { status: 'eligible' }> =>
      target.status === 'eligible',
  )
}

export function getBlockedActionTargets<TBlocker>(
  result: ActionValidationResult<TBlocker>,
): Extract<ActionTargetResult<TBlocker>, { status: 'blocked' }>[] {
  return result.targets.filter(
    (target): target is Extract<ActionTargetResult<TBlocker>, { status: 'blocked' }> =>
      target.status === 'blocked',
  )
}

export function hasActionValidationBlockers<TBlocker>(
  result: ActionValidationResult<TBlocker>,
): boolean {
  return result.targets.some((target) => target.status === 'blocked')
}

export function getWouldChangePlanTargets(plan: ActionPlanResult): ActionPlanTarget[] {
  return plan.targets.filter((target) => target.status === 'wouldChange')
}

export function getUnchangedPlanTargets(plan: ActionPlanResult): ActionPlanTarget[] {
  return plan.targets.filter((target) => target.status === 'unchanged')
}

export function countPlanTargetsByStatus(plan: ActionPlanResult): {
  wouldChange: number
  unchanged: number
} {
  let wouldChange = 0
  let unchanged = 0

  for (const target of plan.targets) {
    if (target.status === 'wouldChange') {
      wouldChange += 1
    } else {
      unchanged += 1
    }
  }

  return { wouldChange, unchanged }
}

export function partitionApplyOutcomes<TBlocker, TFailure extends ActionTargetFailure>(
  outcomes: readonly ActionApplyOutcome<TBlocker, TFailure>[],
): {
  updated: Extract<ActionApplyOutcome<TBlocker, TFailure>, { status: 'updated' }>[]
  blocked: Extract<ActionApplyOutcome<TBlocker, TFailure>, { status: 'blocked' }>[]
  failed: Extract<ActionApplyOutcome<TBlocker, TFailure>, { status: 'failed' }>[]
  unchanged: Extract<ActionApplyOutcome<TBlocker, TFailure>, { status: 'unchanged' }>[]
} {
  const updated: Extract<ActionApplyOutcome<TBlocker, TFailure>, { status: 'updated' }>[] = []
  const blocked: Extract<ActionApplyOutcome<TBlocker, TFailure>, { status: 'blocked' }>[] = []
  const failed: Extract<ActionApplyOutcome<TBlocker, TFailure>, { status: 'failed' }>[] = []
  const unchanged: Extract<ActionApplyOutcome<TBlocker, TFailure>, { status: 'unchanged' }>[] = []

  for (const outcome of outcomes) {
    switch (outcome.status) {
      case 'updated':
        updated.push(outcome)
        break
      case 'blocked':
        blocked.push(outcome)
        break
      case 'failed':
        failed.push(outcome)
        break
      case 'unchanged':
        unchanged.push(outcome)
        break
    }
  }

  return { updated, blocked, failed, unchanged }
}

export function hasApplyOperationalFailures<TBlocker, TFailure extends ActionTargetFailure>(
  outcomes: readonly ActionApplyOutcome<TBlocker, TFailure>[],
): boolean {
  return outcomes.some((outcome) => outcome.status === 'failed')
}

export function mergeApplyBlockedOutcomesIntoValidation<TBlocker>(
  validation: ActionValidationResult<TBlocker>,
  blockedOutcomes: readonly Extract<
    ActionApplyOutcome<TBlocker, ActionTargetFailure>,
    { status: 'blocked' }
  >[],
): ActionValidationResult<TBlocker> {
  const blockedById = new Map(
    blockedOutcomes.map((outcome) => [outcome.targetId, outcome.blockers] as const),
  )
  const mergedTargets = validation.targets.map((target) => {
    const blockers = blockedById.get(target.targetId)
    if (!blockers) {
      return target
    }

    return createBlockedActionTarget(
      { targetId: target.targetId, targetName: target.targetName },
      blockers,
    )
  })

  for (const outcome of blockedOutcomes) {
    if (mergedTargets.some((target) => target.targetId === outcome.targetId)) {
      continue
    }

    mergedTargets.push(
      createBlockedActionTarget(
        { targetId: outcome.targetId, targetName: outcome.targetId },
        outcome.blockers,
      ),
    )
  }

  return createActionValidationResult(mergedTargets)
}
