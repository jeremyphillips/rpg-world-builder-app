import type { CharacterBuildContext, CharacterBuilderDraft, ChoiceSet } from '@rpg/contracts'
import type { CharacterBuilderStepId } from '@rpg/contracts/rpg/character-builder'

import { validateBuilderStepSubmit } from './validate-builder-step'

/** Steps whose rail icon may show a submit-blocking error after Continue or Create. */
export function mergeValidationVisibleStepIds(
  stepIds: readonly CharacterBuilderStepId[],
  newStepIds: readonly CharacterBuilderStepId[],
): CharacterBuilderStepId[] {
  return [...new Set([...stepIds, ...newStepIds])]
}

export function removeValidationVisibleStepId(
  stepIds: readonly CharacterBuilderStepId[],
  stepId: CharacterBuilderStepId,
): CharacterBuilderStepId[] {
  return stepIds.filter((entry) => entry !== stepId)
}

/** Drops steps whose submit validation now passes so resolved issues clear rail errors. */
export function pruneValidationVisibleStepIds(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  stepIds: readonly CharacterBuilderStepId[],
  resolvedChoiceSets: readonly ChoiceSet[] | null,
): CharacterBuilderStepId[] {
  const choiceSets = resolvedChoiceSets ?? []
  return stepIds.filter((stepId) => {
    const result = validateBuilderStepSubmit(draft, context, stepId, choiceSets)
    return !result.ok
  })
}
