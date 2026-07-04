import { defineMessage } from '../../../validation/define-message'

// ---------------------------------------------------------------------------
// Campaign patch validation messages (tier 2 domain catalog).
// ---------------------------------------------------------------------------

export const campaignPatchValidationMessages = {
  subclassChoicesChangeNotAllowed: defineMessage(
    'validation.campaign.subclassChoicesChangeNotAllowed',
    () => 'Subclass choice changes are not allowed.',
  ),
}
