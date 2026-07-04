import { defineMessage } from '../../validation/define-message'
import { betweenCopy } from '../../validation/messages'

// ---------------------------------------------------------------------------
// Ability score validation messages (tier 2).
// ---------------------------------------------------------------------------

export const abilityValidationMessages = {
  characterScoreMaxExceeded: defineMessage<{ max: number }>(
    'validation.ability.characterScoreMaxExceeded',
    ({ max }) => `Ability score cannot exceed ${max}.`,
  ),
  characterScoreOutOfRange: defineMessage<{ min: number; max: number }>(
    'validation.ability.characterScoreOutOfRange',
    ({ min, max }) => betweenCopy('Ability score', min, max),
  ),
}
