import { formatFieldMessage } from '../../../../validation/define-message'

import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { isChoiceSetSatisfied, type ChoiceSet } from '../choice-set'
import type { CharacterBuilderDraft } from '../draft/draft'
import type { CharacterBuilderStepId } from '../../../character-builder/step-ids'
import { getBuilderStepLabel, getChoiceSetStepId } from '../steps'

export type UnresolvedChoiceSetSummary = {
  choiceSetId: string
  label: string
  stepId: CharacterBuilderStepId
  stepLabel: string
  min: number
  max: number
  selectedCount: number
  message: string
}

/**
 * Summarizes every required ChoiceSet that has not reached its `min` selection
 * count. Used by the Review step and preview derivation.
 */
export function resolveUnresolvedChoiceSetSummaries(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): UnresolvedChoiceSetSummary[] {
  return choiceSets
    .filter(
      (choiceSet) =>
        choiceSet.required &&
        !isChoiceSetSatisfied(choiceSet, draft.choiceSelections[choiceSet.id] ?? []),
    )
    .map((choiceSet) => {
      const stepId = getChoiceSetStepId(choiceSet)
      const selectedCount = (draft.choiceSelections[choiceSet.id] ?? []).length

      return {
        choiceSetId: choiceSet.id,
        label: choiceSet.label,
        stepId,
        stepLabel: getBuilderStepLabel(stepId),
        min: choiceSet.min,
        max: choiceSet.max,
        selectedCount,
        message: formatFieldMessage(
          characterBuilderValidationMessages.choiceSetUnsatisfied({
            label: choiceSet.label,
            min: choiceSet.min,
          }),
        ),
      }
    })
}
