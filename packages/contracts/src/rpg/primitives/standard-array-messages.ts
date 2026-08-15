import { defineMessage } from '../../validation/define-message'

// ---------------------------------------------------------------------------
// Standard Array validation messages (tier 2).
// ---------------------------------------------------------------------------

export const standardArrayValidationMessages = {
  wrongLength: defineMessage(
    'validation.standardArray.wrongLength',
    () => 'Standard Array must contain exactly 6 scores.',
  ),
  invalidAbilityScore: defineMessage(
    'validation.standardArray.invalidAbilityScore',
    () => 'Enter a valid ability score.',
  ),
  incompleteClassOrder: defineMessage(
    'validation.standardArray.incompleteClassOrder',
    () => 'Assign each ability exactly once.',
  ),
}
