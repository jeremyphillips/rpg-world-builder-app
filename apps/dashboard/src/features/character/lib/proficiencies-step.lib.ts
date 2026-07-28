import { STEP_CHOICE_TYPES_BY_STEP, type ChoiceSet } from '@rpg/contracts'
import type { CharacterBuilderStepId } from '@rpg/contracts/rpg/character-builder'

import {
  BUILDER_SELECTION_FULL_NOTICE,
  formatChoiceSetDrawerTriggerLabel,
  formatSelectionCounter,
  isChoiceSetSelectionFull,
  isChoiceSetSelectionOverSelected,
} from './selection-counter.lib'

const PROFICIENCIES_CHOICE_TYPES = STEP_CHOICE_TYPES_BY_STEP.proficiencies

export const PROFICIENCIES_STEP_SELECTION_FULL_REASON = BUILDER_SELECTION_FULL_NOTICE

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

export const formatProficiencySelectionCounter = formatSelectionCounter

export const isProficiencyChoiceSetFull = isChoiceSetSelectionFull

export const isProficiencyChoiceSetOverSelected = isChoiceSetSelectionOverSelected

export { formatChoiceSetDrawerTriggerLabel }
