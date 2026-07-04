import { defineMessage } from '../../validation/define-message'

// ---------------------------------------------------------------------------
// Feat validation messages (tier 2).
// ---------------------------------------------------------------------------

export const featValidationMessages = {
  repeatableNotesOnlyWhenAllowed: defineMessage(
    'validation.feat.repeatableNotesOnlyWhenAllowed',
    () => 'Repeat notes are only available when the feat can be taken more than once.',
  ),
}
