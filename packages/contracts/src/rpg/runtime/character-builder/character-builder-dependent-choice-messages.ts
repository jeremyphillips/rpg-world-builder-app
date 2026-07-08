import { defineMessage } from '../../../validation/define-message'

/** Domain kind labels for dependent parent→child builder choices (not display synonyms). */
export const DEPENDENT_CHOICE_KINDS = {
  heritage: 'heritage',
  subclass: 'subclass',
} as const

export type DependentChoiceKind =
  (typeof DEPENDENT_CHOICE_KINDS)[keyof typeof DEPENDENT_CHOICE_KINDS]

function capitalizeKindLabel(kind: string): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

/** Builder workflow copy for inline dependent-choice regions (heritage, subclass, …). */
export const characterBuilderDependentChoiceMessages = {
  requiredStatus: defineMessage(
    'validation.characterBuilder.dependentChoice.requiredStatus',
    () => 'Required',
  ),
  helperText: defineMessage(
    'validation.characterBuilder.dependentChoice.helperText',
    () => 'Choose one option.',
  ),
  manageHeritage: defineMessage(
    'validation.characterBuilder.dependentChoice.manageHeritage',
    () => 'Manage heritage',
  ),
  parentChoiceRequired: defineMessage<{ kind: string }>(
    'validation.characterBuilder.dependentChoice.parentChoiceRequired',
    ({ kind }) => `${capitalizeKindLabel(kind)} required`,
  ),
  parentChoiceSelected: defineMessage<{ selectedOptionLabel: string; kind: string }>(
    'validation.characterBuilder.dependentChoice.parentChoiceSelected',
    ({ selectedOptionLabel, kind }) => `${selectedOptionLabel} ${kind}`,
  ),
  optionSelected: defineMessage<{ selectedOptionLabel: string }>(
    'validation.characterBuilder.dependentChoice.optionSelected',
    ({ selectedOptionLabel }) => `${selectedOptionLabel} selected`,
  ),
}
