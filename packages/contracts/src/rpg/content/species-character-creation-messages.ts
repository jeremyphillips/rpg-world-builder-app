import { defineMessage } from '../../validation/define-message'

// ---------------------------------------------------------------------------
// Species character-creation validation messages (tier 2).
// ---------------------------------------------------------------------------

export const speciesCharacterCreationValidationMessages = {
  classPolicyRequiresClasses: defineMessage(
    'validation.speciesCharacterCreation.classPolicyRequiresClasses',
    () => 'Select at least one class for this restriction mode.',
  ),
  duplicateClassLevelCap: defineMessage(
    'validation.speciesCharacterCreation.duplicateClassLevelCap',
    () => 'Each class can only have one level cap.',
  ),
}
