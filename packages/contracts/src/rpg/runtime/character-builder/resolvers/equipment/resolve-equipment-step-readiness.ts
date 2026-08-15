import { isClassProgressionApplicable } from '../../progression/character-level-policy'
import { characterBuilderStepReadinessMessages } from '../../messages/character-builder-messages'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../../context'
import { indexCharacterBuildCatalog } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { BuilderStepReadinessState } from '../../readiness/step-readiness'
import {
  choiceSetsForStep,
  formatStepReadinessMessage,
  isStepChoiceWorkComplete,
} from '../../readiness/step-readiness-helpers'
import {
  getInvalidStartingEquipmentProficiencyLinks,
  getUnresolvedStartingEquipmentDependencies,
} from './get-unresolved-starting-equipment-dependencies'
import {
  formatMagicItemGrantIncompleteLabel,
  resolveUnresolvedMagicItemGrantIssues,
} from './resolve-equipment-magic-item-grant-step-issues'
import { readSelectedStartingEquipmentOptionId } from './resolve-starting-equipment-choice-sets'

function resolveMagicItemGrantStepBlock(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
}): BuilderStepReadinessState | undefined {
  const issues = resolveUnresolvedMagicItemGrantIssues(args)
  if (issues.length === 0) return undefined

  const first = issues[0]!

  return {
    readiness: 'readyWithChoices',
    message: formatStepReadinessMessage(
      characterBuilderStepReadinessMessages.equipmentMagicItemGrantIncomplete,
      {
        rarityLabel: formatMagicItemGrantIncompleteLabel(first.rarity),
        remaining: first.remaining,
      },
    ),
  }
}

function resolveSkippedEquipmentStepReadiness(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
}): BuilderStepReadinessState {
  const magicItemBlock = resolveMagicItemGrantStepBlock(args)
  if (magicItemBlock) return magicItemBlock

  return {
    readiness: 'complete',
    message: formatStepReadinessMessage(
      characterBuilderStepReadinessMessages.equipmentContinuingWithout,
    ),
  }
}

function resolveStartingEquipmentOptionStepBlock(args: {
  draft: CharacterBuilderDraft
  classId: string
  catalogIndex: CharacterBuildCatalogIndex
}): BuilderStepReadinessState | undefined {
  const { draft, classId, catalogIndex } = args
  const characterClass = catalogIndex.classes.get(classId)
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  const option = characterClass?.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === selectedOptionId,
  )

  if (!characterClass || !option) return undefined

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
        characterBuilderStepReadinessMessages.equipmentPendingIncludedTool,
      ),
    }
  }

  return undefined
}

export function resolveEquipmentStepReadiness(
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[],
  context: CharacterBuildContext,
): BuilderStepReadinessState {
  if (!draft.class.classId && isClassProgressionApplicable(draft.class.level)) {
    return {
      readiness: 'blocked',
      message: formatStepReadinessMessage(
        characterBuilderStepReadinessMessages.equipmentBlockedNoClass,
      ),
    }
  }

  if (draft.equipment?.skipped === true) {
    return resolveSkippedEquipmentStepReadiness({ draft, context })
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
  if (classId) {
    const optionBlock = resolveStartingEquipmentOptionStepBlock({ draft, classId, catalogIndex })
    if (optionBlock) return optionBlock
  }

  const magicItemBlock = resolveMagicItemGrantStepBlock({ draft, context })
  if (magicItemBlock) return magicItemBlock

  return {
    readiness: 'complete',
    // TODO: move this elsewhere.
    // message: formatStepReadinessMessage(
    //   characterBuilderStepReadinessMessages.equipmentReviewComplete,
    // ),
  }
}
