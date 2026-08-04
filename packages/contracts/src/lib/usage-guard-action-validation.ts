import {
  createActionValidationResult,
  createBlockedActionTarget,
  createEligibleActionTarget,
  createSingleTargetValidationResult,
  type ActionTargetIdentity,
  type ActionTargetResult,
  type ActionValidationResult,
} from './action-validation'

/** Shared advisory availability wire shape used by campaign access and usage guards. */
export type UsageGuardAvailabilityWire<TBlocker> =
  | { status: 'allowed' }
  | { status: 'blocked'; blockers: TBlocker[] }

export function mapUsageGuardAvailabilityToActionTarget<TBlocker>(
  target: ActionTargetIdentity,
  availability: UsageGuardAvailabilityWire<TBlocker>,
): ActionTargetResult<TBlocker> {
  if (availability.status === 'allowed') {
    return createEligibleActionTarget(target)
  }

  return createBlockedActionTarget(target, availability.blockers)
}

export function mapUsageGuardAvailabilityBatchToValidationResult<TBlocker>(
  entries: readonly {
    target: ActionTargetIdentity
    availability: UsageGuardAvailabilityWire<TBlocker>
  }[],
): ActionValidationResult<TBlocker> {
  return createActionValidationResult(
    entries.map(({ target, availability }) =>
      mapUsageGuardAvailabilityToActionTarget(target, availability),
    ),
  )
}

export function mapSingleUsageGuardAvailabilityToValidationResult<TBlocker>(
  target: ActionTargetIdentity,
  availability: UsageGuardAvailabilityWire<TBlocker>,
): ActionValidationResult<TBlocker> {
  return createSingleTargetValidationResult(
    mapUsageGuardAvailabilityToActionTarget(target, availability),
  )
}
