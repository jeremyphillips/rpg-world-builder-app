import {
  formatSpellsChooseClassPromptDescription,
  formatSpellsChooseClassPromptHeading,
  STEP_CHOICE_TYPES_BY_STEP,
  type ChoiceSet,
  type BuilderChoiceSectionModel,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import {
  BUILDER_SELECTION_FULL_NOTICE,
  formatChoiceSetDrawerTriggerLabel,
  formatSelectionCounter,
  isChoiceSetSelectionFull,
  isChoiceSetSelectionOverSelected,
} from '../choice-sets/selection-counter.lib'

const SPELLS_CHOICE_TYPES = STEP_CHOICE_TYPES_BY_STEP.spells

export const SPELLS_CHOOSE_CLASS_PROMPT_HEADING = formatSpellsChooseClassPromptHeading()

export const SPELLS_CHOOSE_CLASS_PROMPT_DESCRIPTION = formatSpellsChooseClassPromptDescription()

export const SPELLS_STEP_SELECTION_FULL_REASON = BUILDER_SELECTION_FULL_NOTICE

export const SPELLS_STEP_OVER_SELECTION_MESSAGE =
  'You selected more spells than allowed. Remove extras to continue.' as const

export const SPELLCASTING_FACT_SUMMARY_HEADING = 'Spellcasting' as const

export const SPELLCASTING_FACT_SUMMARY_SUBHEAD =
  'Your class sets your spellcasting ability. Your spell save DC and spell attack modifier are calculated automatically.' as const

/** ChoiceSets owned by the spells builder step. */
export function choiceSetsForSpellsStep(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  if (!SPELLS_CHOICE_TYPES) return []

  return choiceSets.filter((choiceSet) => SPELLS_CHOICE_TYPES.has(choiceSet.choiceType))
}

export function formatSpellChoiceAddLabel(choiceSet: ChoiceSet): string {
  return formatChoiceSetDrawerTriggerLabel(choiceSet, {
    selectedCount: 0,
    max: choiceSet.max,
  })
}

export const formatSpellSelectionCounter = formatSelectionCounter

export const isSpellChoiceSetFull = isChoiceSetSelectionFull

export const isSpellChoiceSetOverSelected = isChoiceSetSelectionOverSelected

export { formatChoiceSetDrawerTriggerLabel }

export function resolveSelectedSpellLabels(
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): { id: string; label: string }[] {
  return selectedIds.map((id) => {
    const option = choiceSet.options.find((entry) => entry.id === id)
    return { id, label: option?.label ?? id }
  })
}

/** Validation issues targeted at a single spell ChoiceSet. */
export function validationIssuesForSpellChoiceSet(
  issues: readonly CharacterBuildValidationIssue[],
  choiceSetId: string,
): CharacterBuildValidationIssue[] {
  return issues.filter((issue) => issue.choiceSetId === choiceSetId)
}

/** Section-level issues when the section owns one ChoiceSet block. */
export function validationIssuesForSpellSection(
  issues: readonly CharacterBuildValidationIssue[],
  section: Pick<BuilderChoiceSectionModel, 'choiceBlocks'>,
): CharacterBuildValidationIssue[] {
  if (section.choiceBlocks.length !== 1) return []
  return validationIssuesForSpellChoiceSet(issues, section.choiceBlocks[0]!.choiceSet.id)
}
