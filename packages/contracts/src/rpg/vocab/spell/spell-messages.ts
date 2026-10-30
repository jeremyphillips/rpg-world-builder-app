import { defineMessage } from '../../../validation/define-message'
import { requiredWhenCopy } from '../../../validation/messages'

// ---------------------------------------------------------------------------
// Spell validation messages (tier 2).
// ---------------------------------------------------------------------------

export const spellValidationMessages = {
  componentRequired: defineMessage(
    'validation.spell.componentRequired',
    () => 'Choose at least one spell component (verbal, somatic, or material).',
  ),
  materialDescriptionRequired: defineMessage('validation.spell.materialDescriptionRequired', () =>
    requiredWhenCopy('Material description', 'the material component is selected'),
  ),
  reactionTriggerRequired: defineMessage('validation.spell.reactionTriggerRequired', () =>
    requiredWhenCopy('Reaction trigger', 'the casting time is a reaction'),
  ),
  reactionTriggerForbidden: defineMessage(
    'validation.spell.reactionTriggerForbidden',
    () => 'A reaction trigger is only allowed when the casting time is a reaction.',
  ),
}
