import {
  assertBatchResponseCorrespondence,
  createMalformedBatchValidationResult,
  isBatchTargetFailureOutcome,
} from '../../../lib/action-validation-batch'
import {
  createActionValidationResult,
  createBlockedActionTarget,
  createEligibleActionTarget,
  createSingleTargetValidationResult,
  type ActionApplyOutcome,
  type ActionBatchValidationResult,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ActionTargetResult,
  type ActionValidationResult,
} from '../../../lib/action-validation'
import type { ContentCampaignAccessAvailabilityBatchResponse } from './campaign-access-batch'
import type { ContentCampaignAccessUpdateResult } from './campaign-access'
import type { ContentUsageBlocker } from './content-deletion'

/** Shared advisory availability wire shape used by campaign access and usage guards. */
export type UsageGuardAvailabilityWire =
  | { status: 'allowed' }
  | { status: 'blocked'; blockers: ContentUsageBlocker[] }

export function mapUsageGuardAvailabilityToActionTarget(
  target: ActionTargetIdentity,
  availability: UsageGuardAvailabilityWire,
): ActionTargetResult<ContentUsageBlocker> {
  if (availability.status === 'allowed') {
    return createEligibleActionTarget(target)
  }

  return createBlockedActionTarget(target, availability.blockers)
}

export function mapUsageGuardAvailabilityBatchToValidationResult(
  entries: readonly {
    target: ActionTargetIdentity
    availability: UsageGuardAvailabilityWire
  }[],
): ActionValidationResult<ContentUsageBlocker> {
  return createActionValidationResult(
    entries.map(({ target, availability }) =>
      mapUsageGuardAvailabilityToActionTarget(target, availability),
    ),
  )
}

export function mapContentCampaignAccessUpdateResultToApplyOutcome(
  targetId: string,
  result: ContentCampaignAccessUpdateResult,
): Extract<
  ActionApplyOutcome<ContentUsageBlocker, ActionTargetFailure>,
  { status: 'updated' | 'blocked' }
> {
  if (result.status === 'updated') {
    return { status: 'updated', targetId }
  }

  return {
    status: 'blocked',
    targetId,
    blockers: result.blockers,
  }
}

export function mapSingleUsageGuardAvailabilityToValidationResult(
  target: ActionTargetIdentity,
  availability: UsageGuardAvailabilityWire,
): ActionValidationResult<ContentUsageBlocker> {
  return createSingleTargetValidationResult(
    mapUsageGuardAvailabilityToActionTarget(target, availability),
  )
}

export function mapContentCampaignAccessAvailabilityBatchResponse(
  requestedIds: readonly string[],
  response: ContentCampaignAccessAvailabilityBatchResponse,
): ActionBatchValidationResult<ContentUsageBlocker> {
  const correspondenceError = assertBatchResponseCorrespondence(requestedIds, response.targets)
  if (correspondenceError) {
    return createMalformedBatchValidationResult(requestedIds)
  }

  const validationTargets: ActionTargetResult<ContentUsageBlocker>[] = []
  const failures: Array<{ targetId: string; failure: ActionTargetFailure }> = []

  for (const outcome of response.targets) {
    if (isBatchTargetFailureOutcome(outcome)) {
      failures.push({ targetId: outcome.targetId, failure: outcome.failure })
      continue
    }

    validationTargets.push(
      mapUsageGuardAvailabilityToActionTarget(
        { targetId: outcome.targetId, targetName: outcome.targetName },
        outcome.availability,
      ),
    )
  }

  return {
    validation: createActionValidationResult(validationTargets),
    failures,
  }
}
