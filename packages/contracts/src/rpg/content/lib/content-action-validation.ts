import {
  assertBatchResponseCorrespondence,
  createMalformedBatchValidationResult,
  isBatchTargetFailureOutcome,
} from '../../../lib/action-validation-batch'
import {
  createActionValidationResult,
  type ActionApplyOutcome,
  type ActionBatchValidationResult,
  type ActionTargetFailure,
  type ActionTargetResult,
} from '../../../lib/action-validation'
import { mapUsageGuardAvailabilityToActionTarget } from '../../../lib/usage-guard-action-validation'
import type { ContentCampaignAccessAvailabilityBatchResponse } from './campaign-access/campaign-access-batch'
import type { ContentCampaignAccessUpdateResult } from './campaign-access/campaign-access'
import type { ContentUsageBlocker } from './content-usage-blocker'

export type { UsageGuardAvailabilityWire } from '../../../lib/usage-guard-action-validation'

export {
  mapSingleUsageGuardAvailabilityToValidationResult,
  mapUsageGuardAvailabilityBatchToValidationResult,
  mapUsageGuardAvailabilityToActionTarget,
} from '../../../lib/usage-guard-action-validation'

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
