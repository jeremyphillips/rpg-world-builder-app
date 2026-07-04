import { defineMessage } from '../../../validation/define-message'

// ---------------------------------------------------------------------------
// Character builder validation messages (surface catalog).
// Wizard workflow/state copy only — incomplete steps, pending draft choices.
// Rules describing valid character data stay in characterValidationMessages
// (validation.character.*); this catalog may reuse that one but never the
// reverse. See docs/validation-messages.md.
// ---------------------------------------------------------------------------

export const characterBuilderValidationMessages = {
  stepIncomplete: defineMessage(
    'validation.characterBuilder.stepIncomplete',
    () => 'Complete this step before continuing.',
  ),
  standardArrayExactAssignment: defineMessage(
    'validation.characterBuilder.standardArrayExactAssignment',
    () => 'Assign each standard array value to exactly one ability.',
  ),
}
