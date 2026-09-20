import {
  STEP_CHOICE_TYPES_BY_STEP,
  type BuilderStepReadinessState,
  type ChoiceSet,
  type ProficiencyInteractiveSection,
  type ProficiencyStepModel,
} from '@rpg/contracts'
import type {
  CharacterBuilderStepId,
  CharacterBuildValidationIssue,
} from '@rpg/contracts/rpg/character-builder'

import {
  formatChoiceSetDrawerTriggerLabel,
  isChoiceSetSelectionFull,
  isChoiceSetSelectionOverSelected,
} from '../choice-sets/selection-counter.lib'

const PROFICIENCIES_CHOICE_TYPES = STEP_CHOICE_TYPES_BY_STEP.proficiencies

export const PROFICIENCIES_CHOOSE_CLASS_PROMPT_HEADING =
  'Choose a class to configure class proficiencies'

export const PROFICIENCIES_CHOOSE_CLASS_PROMPT_DESCRIPTION =
  'Your class determines saving throws, skill choices, armor, weapon, and tool proficiencies.'

export const PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE =
  'You selected more proficiencies than allowed. Remove extras to continue.' as const

/** ChoiceSets owned by the proficiencies builder step. */
export function choiceSetsForProficienciesStep(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  if (!PROFICIENCIES_CHOICE_TYPES) return []

  return choiceSets.filter((choiceSet) => PROFICIENCIES_CHOICE_TYPES.has(choiceSet.choiceType))
}

export function isProficienciesStep(stepId: CharacterBuilderStepId): boolean {
  return stepId === 'proficiencies'
}

export function formatProficiencyChoiceAddLabel(choiceSet: ChoiceSet): string {
  return formatChoiceSetDrawerTriggerLabel(choiceSet, {
    selectedCount: 0,
    max: choiceSet.max,
  })
}

export function formatProficiencyChosenCounter(selectedCount: number, max: number): string {
  return `${selectedCount} / ${max} chosen`
}

/** @deprecated Prefer aggregateCount.label from resolveProficiencyStepModel or formatProficiencyChosenCounter. */
export const formatProficiencySelectionCounter = formatProficiencyChosenCounter

export function reconcileProficiencyStepReadiness(
  readiness: BuilderStepReadinessState,
  model: Pick<ProficiencyStepModel, 'hasUnresolvedPrerequisites'>,
): BuilderStepReadinessState {
  if (!model.hasUnresolvedPrerequisites) return readiness

  if (readiness.readiness === 'complete' || readiness.readiness === 'readyEmpty') {
    return { readiness: 'readyWithChoices' }
  }

  return readiness
}

export const isProficiencyChoiceSetFull = isChoiceSetSelectionFull

export const isProficiencyChoiceSetOverSelected = isChoiceSetSelectionOverSelected

/** Validation issues targeted at a single proficiency ChoiceSet. */
export function validationIssuesForProficiencyChoiceSet(
  issues: readonly CharacterBuildValidationIssue[],
  choiceSetId: string,
): CharacterBuildValidationIssue[] {
  return issues.filter((issue) => issue.choiceSetId === choiceSetId)
}

/** Section-level issues when the category owns one ChoiceSet block. */
export function validationIssuesForProficiencySection(
  issues: readonly CharacterBuildValidationIssue[],
  section: Pick<ProficiencyInteractiveSection, 'choiceBlocks'>,
): CharacterBuildValidationIssue[] {
  if (section.choiceBlocks.length !== 1) return []

  return validationIssuesForProficiencyChoiceSet(issues, section.choiceBlocks[0]!.choiceSet.id)
}

export { formatChoiceSetDrawerTriggerLabel }
