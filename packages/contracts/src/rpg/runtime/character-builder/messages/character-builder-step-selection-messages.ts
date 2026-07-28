import { defineMessage } from '../../../../validation/define-message'

/** Cross-step builder option-sheet selection affordances (species, class, …). */
export const characterBuilderStepSelectionMessages = {
  selectSpecies: defineMessage(
    'validation.characterBuilder.stepSelection.selectSpecies',
    () => 'Select species',
  ),
  selectClass: defineMessage(
    'validation.characterBuilder.stepSelection.selectClass',
    () => 'Select class',
  ),
  selectedBadge: defineMessage(
    'validation.characterBuilder.stepSelection.selectedBadge',
    () => 'Selected',
  ),
} as const
