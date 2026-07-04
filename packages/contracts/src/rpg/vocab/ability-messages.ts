import { defineMessage } from '../../validation/define-message'

// ---------------------------------------------------------------------------
// Ability score validation messages (tier 2).
// ---------------------------------------------------------------------------

export const abilityValidationMessages = {
  characterScoreMaxExceeded: defineMessage<{ max: number }>(
    'validation.ability.characterScoreMaxExceeded',
    ({ max }) => `Ability score cannot exceed ${max}.`,
  ),
}
