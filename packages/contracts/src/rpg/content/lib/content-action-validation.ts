import {
  createActionValidationResult,
  createBlockedActionTarget,
  createEligibleActionTarget,
  createSingleTargetValidationResult,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ActionTargetResult,
  type ActionValidationResult,
} from '../../../lib/action-validation'
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
