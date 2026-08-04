import type { ActionValidationResult } from '../../lib/action-validation'
import {
  mapSingleUsageGuardAvailabilityToValidationResult,
  mapUsageGuardAvailabilityBatchToValidationResult,
  mapUsageGuardAvailabilityToActionTarget,
  type UsageGuardAvailabilityWire,
} from '../content/lib/content-action-validation'
import type { ContentUsageBlocker } from '../content/lib/content-deletion'
import type { VocabularyDisableAvailability } from '../content/lib/content-deletion'

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

export type { UsageGuardAvailabilityWire }
