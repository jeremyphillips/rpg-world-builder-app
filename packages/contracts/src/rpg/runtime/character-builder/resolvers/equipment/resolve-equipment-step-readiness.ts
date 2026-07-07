import { characterBuilderStepReadinessMessages } from '../../character-builder-messages'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuilderDraft } from '../../draft'
import type { BuilderStepReadinessState } from '../../step-readiness'
import {
  choiceSetsForStep,
  formatStepReadinessMessage,
  isStepChoiceWorkComplete,
} from '../../step-readiness-helpers'

export function resolveEquipmentStepReadiness(
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[],
): BuilderStepReadinessState {
  if (!draft.class.classId) {
    return {
      readiness: 'blocked',
      message: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.equipmentBlockedNoClass,
      ),
    }
  }

  if (draft.equipment?.skipped === true) {
    return {
      readiness: 'complete',
      message: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.equipmentContinuingWithout,
      ),
    }
  }

  const stepChoiceSets = choiceSetsForStep('equipment', resolvedChoiceSets)

  if (stepChoiceSets.length === 0) {
    return {
      readiness: 'readyEmpty',
      message: formatStepReadinessMessage(characterBuilderStepReadinessMessages.equipmentNoOptions),
    }
  }

  if (isStepChoiceWorkComplete(stepChoiceSets, draft)) {
    return {
      readiness: 'complete',
      message: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.equipmentReviewComplete,
      ),
    }
  }

  return { readiness: 'readyWithChoices' }
}
