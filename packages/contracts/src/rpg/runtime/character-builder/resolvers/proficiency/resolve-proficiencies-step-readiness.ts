import { characterBuilderStepReadinessMessages } from '../../messages/character-builder-messages'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { BuilderStepReadinessState } from '../../readiness/step-readiness'
import {
  choiceSetsForStep,
  formatStepReadinessMessage,
  isStepChoiceWorkComplete,
} from '../../readiness/step-readiness-helpers'

export function resolveProficienciesStepReadiness(
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[],
): BuilderStepReadinessState {
  if (!draft.class.classId) {
    return {
      readiness: 'blocked',
      classDependentBlocked: true,
      message: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.proficienciesBlockedNoClass,
      ),
      helperText: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.proficienciesBlockedNoClassHelper,
      ),
    }
  }

  const stepChoiceSets = choiceSetsForStep('proficiencies', resolvedChoiceSets)

  if (stepChoiceSets.length === 0) {
    return {
      readiness: 'readyEmpty',
      message: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.proficienciesNoChoicesRequired,
      ),
    }
  }

  if (isStepChoiceWorkComplete(stepChoiceSets, draft)) {
    return {
      readiness: 'complete',
      message: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.proficienciesReviewComplete,
      ),
    }
  }

  return { readiness: 'readyWithChoices' }
}
