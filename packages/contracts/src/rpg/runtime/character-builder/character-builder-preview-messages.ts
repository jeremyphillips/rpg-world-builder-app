import { defineMessage } from '../../../validation/define-message'

// ---------------------------------------------------------------------------
// Character builder preview messages — advisory copy for the live preview
// panel. Distinct from validation messages (blocking issues / form errors).
// See docs/validation-messages.md.
// ---------------------------------------------------------------------------

export const characterBuilderPreviewMessages = {
  nameNotSet: defineMessage(
    'validation.characterBuilderPreview.nameNotSet',
    () => 'Name is not set.',
  ),
  speciesNotSelected: defineMessage(
    'validation.characterBuilderPreview.speciesNotSelected',
    () => 'Species is not selected.',
  ),
  classNotSelected: defineMessage(
    'validation.characterBuilderPreview.classNotSelected',
    () => 'Class is not selected.',
  ),
  requiredChoicesIncomplete: defineMessage(
    'validation.characterBuilderPreview.requiredChoicesIncomplete',
    () => 'Some required choices are incomplete.',
  ),
}
