import {
  STEP_CHOICE_TYPES_BY_STEP,
  type ChoiceSet,
  type CharacterBuilderStepId,
} from '@rpg/contracts'

const PROFICIENCIES_CHOICE_TYPES = STEP_CHOICE_TYPES_BY_STEP.proficiencies

/** ChoiceSets owned by the proficiencies builder step. */
export function choiceSetsForProficienciesStep(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  if (!PROFICIENCIES_CHOICE_TYPES) return []

  return choiceSets.filter((choiceSet) => PROFICIENCIES_CHOICE_TYPES.has(choiceSet.choiceType))
}

export function formatChoiceSetSelectionHint(choiceSet: ChoiceSet): string | undefined {
  if (choiceSet.min === choiceSet.max) {
    return choiceSet.min === 1 ? 'Choose 1 option' : `Choose ${choiceSet.min} options`
  }

  return `Choose ${choiceSet.min}–${choiceSet.max} options`
}

export function isProficienciesStep(stepId: CharacterBuilderStepId): boolean {
  return stepId === 'proficiencies'
}
