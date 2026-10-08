import { defineMessage } from '../../../../validation/define-message'
import { getContentTypeSentenceForm } from '../../../content/lib/content-type-terms'

/** Cross-step builder option-sheet selection affordances (species, class, …). */
export const characterBuilderStepSelectionMessages = {
  selectSpecies: defineMessage(
    'validation.characterBuilder.stepSelection.selectSpecies',
    () => `Select ${getContentTypeSentenceForm('species')}`,
  ),
  selectClass: defineMessage(
    'validation.characterBuilder.stepSelection.selectClass',
    () => `Select ${getContentTypeSentenceForm('classes')}`,
  ),
  selectedBadge: defineMessage(
    'validation.characterBuilder.stepSelection.selectedBadge',
    () => 'Selected',
  ),
} as const
