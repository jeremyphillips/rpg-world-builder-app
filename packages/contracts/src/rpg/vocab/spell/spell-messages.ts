import { defineMessage } from '../../../validation/define-message'
import { requiredWhenCopy } from '../../../validation/messages'

// ---------------------------------------------------------------------------
// Spell validation messages (tier 2).
// ---------------------------------------------------------------------------

export const spellValidationMessages = {
  componentRequired: defineMessage(
    'validation.spell.componentRequired',
    () => 'Select at least one spell component (verbal, somatic, or material).',
  ),
  materialDescriptionRequired: defineMessage('validation.spell.materialDescriptionRequired', () =>
    requiredWhenCopy('Material description', 'the material component is selected'),
  ),
}
