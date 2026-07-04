import { defineMessage } from '../../validation/define-message'

// ---------------------------------------------------------------------------
// Vocabulary membership validation messages (tier 2).
// ---------------------------------------------------------------------------

export const vocabularyValidationMessages = {
  unrecognizedOption: defineMessage(
    'validation.vocabulary.unrecognizedOption',
    () => 'This value is not available in the campaign vocabulary.',
  ),
}
