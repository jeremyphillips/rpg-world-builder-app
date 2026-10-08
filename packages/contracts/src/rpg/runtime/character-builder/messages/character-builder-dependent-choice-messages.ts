import { defineMessage } from '../../../../validation/define-message'
import {
  formatChangeSpeciesHeritageLabel,
  getSpeciesHeritageKindLabel,
  getSpeciesHeritageSentenceForm,
} from '../../../vocab/species/heritage'

/** Domain kind labels for dependent parent→child builder choices (not display synonyms). */
export const DEPENDENT_CHOICE_KINDS = {
  heritage: getSpeciesHeritageSentenceForm(1),
  subclass: 'subclass',
} as const

export type DependentChoiceKind =
  (typeof DEPENDENT_CHOICE_KINDS)[keyof typeof DEPENDENT_CHOICE_KINDS]

function capitalizeKindLabel(kind: string): string {
  if (kind === DEPENDENT_CHOICE_KINDS.heritage) return getSpeciesHeritageKindLabel()
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
  changeHeritage: defineMessage('validation.characterBuilder.dependentChoice.changeHeritage', () =>
    formatChangeSpeciesHeritageLabel(),
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
    ({ selectedOptionLabel }) => `Selected: ${selectedOptionLabel}`,
  ),
}
