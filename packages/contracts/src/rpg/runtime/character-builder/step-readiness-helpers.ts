import { formatFieldMessage } from '../../../validation/define-message'
import type { MessageDef, MessageParams } from '../../../validation/define-message'
import { characterBuilderProficiencyChoiceEmptyMessages } from './character-builder-messages'
import { areRequiredChoiceSetsSatisfied, type ChoiceSet } from './choice-set'
import type { CharacterBuilderDraft } from './draft'
import { STEP_CHOICE_TYPES_BY_STEP } from './steps'

export const BUILDER_STEP_READINESS_STEP_IDS = ['proficiencies', 'equipment', 'spells'] as const

export type BuilderStepReadinessStepId = (typeof BUILDER_STEP_READINESS_STEP_IDS)[number]

const PROFICIENCY_CHOICE_EMPTY_BY_TYPE = {
  language: characterBuilderProficiencyChoiceEmptyMessages.language,
  skillProficiency: characterBuilderProficiencyChoiceEmptyMessages.skillProficiency,
  toolProficiency: characterBuilderProficiencyChoiceEmptyMessages.toolProficiency,
  weaponProficiency: characterBuilderProficiencyChoiceEmptyMessages.weaponProficiency,
  armorTraining: characterBuilderProficiencyChoiceEmptyMessages.armorTraining,
} as const satisfies Partial<Record<ChoiceSet['choiceType'], MessageDef<void>>>

export function formatProficiencyChoiceEmptyMessage(choiceType: ChoiceSet['choiceType']): string {
  const message =
    PROFICIENCY_CHOICE_EMPTY_BY_TYPE[choiceType as keyof typeof PROFICIENCY_CHOICE_EMPTY_BY_TYPE] ??
    characterBuilderProficiencyChoiceEmptyMessages.fallback
  return formatStepReadinessMessage(message)
}

export function formatStepReadinessMessage<P extends MessageParams | void = void>(
  message: MessageDef<P>,
  params?: P,
): string {
  const raw =
    params === undefined ? (message as () => string)() : (message as (params: P) => string)(params)
  return formatFieldMessage(raw)
}

export function choiceSetsForStep(
  stepId: BuilderStepReadinessStepId,
  choiceSets: readonly ChoiceSet[],
): ChoiceSet[] {
  const types = STEP_CHOICE_TYPES_BY_STEP[stepId]
  if (!types) return []
  return choiceSets.filter((choiceSet) => types.has(choiceSet.choiceType))
}

export function isStepChoiceWorkComplete(
  stepChoiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
): boolean {
  return areRequiredChoiceSetsSatisfied(stepChoiceSets, draft.choiceSelections)
}
