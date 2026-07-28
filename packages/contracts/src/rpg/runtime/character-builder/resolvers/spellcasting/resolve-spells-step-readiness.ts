import { characterBuilderStepReadinessMessages } from '../../messages/character-builder-messages'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { BuilderStepReadinessState } from '../../readiness/step-readiness'
import {
  choiceSetsForStep,
  formatStepReadinessMessage,
  isStepChoiceWorkComplete,
} from '../../readiness/step-readiness-helpers'
import { resolveSpellStepApplicability } from './resolve-spell-step-applicability'

export function resolveSpellsStepReadiness(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  resolvedChoiceSets: readonly ChoiceSet[],
): BuilderStepReadinessState {
  const applicability = resolveSpellStepApplicability(draft, context)

  if (applicability.kind === 'blocked') {
    return {
      readiness: 'blocked',
      message: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.spellsBlockedNoClass,
      ),
    }
  }

  if (applicability.kind === 'notApplicable') {
    const message =
      applicability.reason === 'noSpellcasting'
        ? formatStepReadinessMessage(
            characterBuilderStepReadinessMessages.spellsNotApplicableNoSpellcasting,
            { className: applicability.className },
          )
        : formatStepReadinessMessage(
            characterBuilderStepReadinessMessages.spellsNotApplicableInactiveAtLevel,
            { className: applicability.className, level: applicability.level },
          )

    return {
      readiness: 'notApplicable',
      message,
    }
  }

  const stepChoiceSets = choiceSetsForStep('spells', resolvedChoiceSets)

  if (stepChoiceSets.length === 0) {
    return { readiness: 'readyEmpty' }
  }

  if (isStepChoiceWorkComplete(stepChoiceSets, draft)) {
    return {
      readiness: 'complete',
      message: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.spellsReviewComplete,
      ),
    }
  }

  return { readiness: 'readyWithChoices' }
}
