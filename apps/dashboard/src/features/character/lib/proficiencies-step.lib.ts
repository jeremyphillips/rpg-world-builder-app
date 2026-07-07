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

export function isProficienciesStep(stepId: CharacterBuilderStepId): boolean {
  return stepId === 'proficiencies'
}
