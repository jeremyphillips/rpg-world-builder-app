import {
  partitionApplyOutcomes,
  type ActionApplyOutcome,
  type ActionTargetFailure,
} from '@rpg/contracts'

export type ActionApplySummary = {
  updatedIds: string[]
  blockedIds: string[]
  failedIds: string[]
  fullSuccess: boolean
}

/** Derive post-apply ids and success flag from lifecycle apply outcomes. */
export function deriveActionApplySummary<TBlocker, TFailure extends ActionTargetFailure>(
  outcomes: readonly ActionApplyOutcome<TBlocker, TFailure>[],
): ActionApplySummary {
  const { updated, blocked, failed } = partitionApplyOutcomes(outcomes)

  return {
    updatedIds: updated.map((outcome) => outcome.targetId),
    blockedIds: blocked.map((outcome) => outcome.targetId),
    failedIds: failed.map((outcome) => outcome.targetId),
    fullSuccess: updated.length > 0 && blocked.length === 0 && failed.length === 0,
  }
}
