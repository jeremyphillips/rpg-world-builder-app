import { getTermSentenceForm, REQUIREMENT_CONDITION_TYPE_TERM } from '@rpg/contracts'

import { vocabularyFieldLabel } from '@/features/vocabulary'

/** Sentence-case field label for the prerequisite condition type select. */
export const requirementConditionTypeLabel = vocabularyFieldLabel(REQUIREMENT_CONDITION_TYPE_TERM)

/** Tier-1 required single-select message for the condition type field. */
export function requirementConditionTypeRequiredSelectMessage(): string {
  return `Select ${getTermSentenceForm(REQUIREMENT_CONDITION_TYPE_TERM, 1)}.`
}
