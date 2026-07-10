import { characterBuilderStepReadinessMessages } from '../../character-builder-messages'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildContext } from '../../context'
import { indexCharacterBuildCatalog } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import type { BuilderStepReadinessState } from '../../step-readiness'
import {
  choiceSetsForStep,
  formatStepReadinessMessage,
  isStepChoiceWorkComplete,
} from '../../step-readiness-helpers'
import {
  getInvalidStartingEquipmentProficiencyLinks,
  getUnresolvedStartingEquipmentDependencies,
} from './get-unresolved-starting-equipment-dependencies'
import { readSelectedStartingEquipmentOptionId } from './resolve-starting-equipment-choice-sets'

export function resolveEquipmentStepReadiness(
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[],
  context: CharacterBuildContext,
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

  if (!isStepChoiceWorkComplete(stepChoiceSets, draft)) {
    return { readiness: 'readyWithChoices' }
  }

  const classId = draft.class.classId
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = catalogIndex.classes.get(classId)
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  const option = characterClass?.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === selectedOptionId,
  )

  if (characterClass && option) {
    const invalidLinks = getInvalidStartingEquipmentProficiencyLinks({
      option,
      classId,
      characterClass,
      choiceSelections: draft.choiceSelections,
      catalogIndex,
    })
    if (invalidLinks.length > 0) {
      return {
        readiness: 'readyWithChoices',
        message: invalidLinks[0]!.issue,
      }
    }

    const pendingDependencies = getUnresolvedStartingEquipmentDependencies({
      option,
      classId,
      characterClass,
      choiceSelections: draft.choiceSelections,
      catalogIndex,
    })
    if (pendingDependencies.length > 0) {
      return {
        readiness: 'readyWithChoices',
        message: formatStepReadinessMessage(
          characterBuilderStepReadinessMessages.equipmentPendingProficiencyLinked,
        ),
      }
    }
  }

  return {
    readiness: 'complete',
    message: formatStepReadinessMessage(
      characterBuilderStepReadinessMessages.equipmentReviewComplete,
    ),
  }
}
