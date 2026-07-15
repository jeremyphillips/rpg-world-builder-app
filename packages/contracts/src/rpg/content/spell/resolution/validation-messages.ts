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
  resolutionRequiresMeaningfulOutcome: defineMessage(
    'validation.spellResolution.resolutionRequiresMeaningfulOutcome',
    () => 'Add at least one outcome with an effect application or additional behavior.',
  ),
  duplicateOutcomeApplicationEffectId: defineMessage(
    'validation.spellResolution.duplicateOutcomeApplicationEffectId',
    () => 'Each effect can only be applied once per outcome.',
  ),
  halfNotSupportedForEffectKind: defineMessage<{ kind: string }>(
    'validation.spellResolution.halfNotSupportedForEffectKind',
    ({ kind }) => `Half application is not supported for "${kind}" effects in this version.`,
  ),
  effectKindIncompatibleWithTarget: defineMessage<{ kind: string; targetKind: string }>(
    'validation.spellResolution.effectKindIncompatibleWithTarget',
    ({ kind, targetKind }) =>
      `"${kind}" effects cannot target ${targetKind === 'object' ? 'objects' : 'creatures or objects'}.`,
  ),
}
