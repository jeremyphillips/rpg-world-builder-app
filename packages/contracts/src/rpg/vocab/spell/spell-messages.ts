import { defineMessage } from '../../../validation/define-message'

// ---------------------------------------------------------------------------
// Spell validation messages (tier 2).
// ---------------------------------------------------------------------------

export const spellValidationMessages = {
  componentRequired: defineMessage(
    'validation.spell.componentRequired',
    () => 'Select at least one spell component (verbal, somatic, or material).',
  ),
}
