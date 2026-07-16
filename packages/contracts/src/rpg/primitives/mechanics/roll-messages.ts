import { defineMessage } from '../../../validation/define-message'

export const rollValidationMessages = {
  atLeastOneRequired: defineMessage(
    'validation.roll.atLeastOneRequired',
    () => 'A roll must include dice, a flat value, or both.',
  ),
}
