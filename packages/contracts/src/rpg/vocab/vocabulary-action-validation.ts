import type {
  ActionBatchValidationResult,
  ActionTargetFailure,
  ActionValidationResult,
} from '../../lib/action-validation'
import { createActionValidationResult } from '../../lib/action-validation'
import {
  assertBatchResponseCorrespondence,
  createMalformedBatchValidationResult,
  isBatchTargetFailureOutcome,
} from '../../lib/action-validation-batch'
import {
  mapSingleUsageGuardAvailabilityToValidationResult,
  mapUsageGuardAvailabilityBatchToValidationResult,
  mapUsageGuardAvailabilityToActionTarget,
} from '../../lib/usage-guard-action-validation'
import type { VocabularyDisableAvailability } from './vocabulary-disable-availability'
import type { VocabularyUsageBlocker } from './vocabulary-disable-availability'
import type { VocabularyDisableAvailabilityBatchResponse } from './vocabulary-disable-availability-batch'

export type VocabularyDisableAvailabilityWire = VocabularyDisableAvailability

export function mapVocabularyDisableAvailabilityToActionTarget(
  target: { targetId: string; targetName: string },
  availability: VocabularyDisableAvailabilityWire,
) {
  return mapUsageGuardAvailabilityToActionTarget(target, availability)
}

export function mapVocabularyDisableAvailabilityBatchToValidationResult(
  entries: readonly {
    target: { targetId: string; targetName: string }
    availability: VocabularyDisableAvailabilityWire
  }[],
): ActionValidationResult<VocabularyUsageBlocker> {
  return mapUsageGuardAvailabilityBatchToValidationResult(entries)
}

export function mapSingleVocabularyDisableAvailabilityToValidationResult(
  target: { targetId: string; targetName: string },
  availability: VocabularyDisableAvailabilityWire,
): ActionValidationResult<VocabularyUsageBlocker> {
  return mapSingleUsageGuardAvailabilityToValidationResult(target, availability)
}

export function mapVocabularyDisableAvailabilityBatchResponse(
  requestedIds: readonly string[],
  response: VocabularyDisableAvailabilityBatchResponse,
): ActionBatchValidationResult<VocabularyUsageBlocker> {
  const correspondenceError = assertBatchResponseCorrespondence(requestedIds, response.targets)
  if (correspondenceError) {
    return createMalformedBatchValidationResult(requestedIds)
  }

  const validationTargets = []
  const failures: Array<{ targetId: string; failure: ActionTargetFailure }> = []

  for (const outcome of response.targets) {
    if (isBatchTargetFailureOutcome(outcome)) {
      failures.push({ targetId: outcome.targetId, failure: outcome.failure })
      continue
    }

    validationTargets.push(
      mapVocabularyDisableAvailabilityToActionTarget(
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
