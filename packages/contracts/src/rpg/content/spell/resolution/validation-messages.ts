import { defineMessage } from '../../../../validation/define-message'

// ---------------------------------------------------------------------------
// Spell resolution validation messages (tier 2).
// ---------------------------------------------------------------------------

export const spellResolutionValidationMessages = {
  duplicateEffectId: defineMessage(
    'validation.spellResolution.duplicateEffectId',
    () => 'Each resolution effect must have a unique id.',
  ),
  duplicateOutcomeResult: defineMessage(
    'validation.spellResolution.duplicateOutcomeResult',
    () => 'Each outcome must have a unique result.',
  ),
  unknownEffectReference: defineMessage<{ effectId: string }>(
    'validation.spellResolution.unknownEffectReference',
    ({ effectId }) => `Outcome references unknown effect "${effectId}".`,
  ),
  outcomeResultNotAllowedForMethod: defineMessage<{ result: string }>(
    'validation.spellResolution.outcomeResultNotAllowedForMethod',
    ({ result }) => `Outcome result "${result}" is not allowed for this resolution method.`,
  ),
  outcomeRequiresApplicationOrNote: defineMessage(
    'validation.spellResolution.outcomeRequiresApplicationOrNote',
    () => 'Add an effect application or describe the outcome.',
  ),
}
