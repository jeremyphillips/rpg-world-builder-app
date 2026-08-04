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
  type UsageGuardAvailabilityWire,
} from '../content/lib/content-action-validation'
import type { ContentUsageBlocker } from '../content/lib/content-deletion'
import type { VocabularyDisableAvailability } from '../content/lib/content-deletion'
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
): ActionValidationResult<ContentUsageBlocker> {
  return mapUsageGuardAvailabilityBatchToValidationResult(entries)
}

export function mapSingleVocabularyDisableAvailabilityToValidationResult(
  target: { targetId: string; targetName: string },
  availability: VocabularyDisableAvailabilityWire,
): ActionValidationResult<ContentUsageBlocker> {
  return mapSingleUsageGuardAvailabilityToValidationResult(target, availability)
}

export function mapVocabularyDisableAvailabilityBatchResponse(
  requestedIds: readonly string[],
  response: VocabularyDisableAvailabilityBatchResponse,
): ActionBatchValidationResult<ContentUsageBlocker> {
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

export type { UsageGuardAvailabilityWire }
