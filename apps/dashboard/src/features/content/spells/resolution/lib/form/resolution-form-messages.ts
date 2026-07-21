import { DAMAGE_TYPE_TERM, defineMessage, getTermSentenceForm, withArticle } from '@rpg/contracts'

// ---------------------------------------------------------------------------
// Resolution form validation messages (dashboard tier 3).
// ---------------------------------------------------------------------------

export const resolutionFormValidationMessages = {
  attackTypeRequired: defineMessage(
    'validation.spellResolutionForm.attackTypeRequired',
    () => 'Select a melee or ranged spell attack.',
  ),
  saveAbilityRequired: defineMessage(
    'validation.spellResolutionForm.saveAbilityRequired',
    () => 'Select a saving throw ability.',
  ),
  proximityDistanceRequired: defineMessage(
    'validation.spellResolutionForm.proximityDistanceRequired',
    () => 'Enter a distance in feet.',
  ),
  originDistanceRequired: defineMessage(
    'validation.spellResolutionForm.originDistanceRequired',
    () => 'Enter an origin distance in feet.',
  ),
  /** @deprecated Use proximityDistanceRequired */
  rangeDistanceRequired: defineMessage(
    'validation.spellResolutionForm.rangeDistanceRequired',
    () => 'Enter a distance in feet.',
  ),
  damageRollRequired: defineMessage(
    'validation.spellResolutionForm.damageRollRequired',
    () => 'Enter a damage roll.',
  ),
  damageTypeRequired: defineMessage(
    'validation.spellResolutionForm.damageTypeRequired',
    () => `Select ${withArticle(getTermSentenceForm(DAMAGE_TYPE_TERM, 1))}.`,
  ),
  projectileCountRequired: defineMessage(
    'validation.spellResolutionForm.projectileCountRequired',
    () => 'Enter a projectile count.',
  ),
  duplicateOutcomeResult: defineMessage(
    'validation.spellResolutionForm.duplicateOutcomeResult',
    () => 'Each outcome must have a unique result.',
  ),
  unknownEffectReference: defineMessage<{ effectId: string }>(
    'validation.spellResolutionForm.unknownEffectReference',
    ({ effectId }) => `Outcome references unknown effect "${effectId}".`,
  ),
  outcomeResultNotAllowedForMethod: defineMessage<{ result: string }>(
    'validation.spellResolutionForm.outcomeResultNotAllowedForMethod',
    ({ result }) => `Outcome result "${result}" is not allowed for this resolution method.`,
  ),
  resolutionRequiresMeaningfulOutcome: defineMessage(
    'validation.spellResolutionForm.resolutionRequiresMeaningfulOutcome',
    () => 'Add at least one outcome with an effect application or additional behavior.',
  ),
  duplicateOutcomeApplicationEffectId: defineMessage(
    'validation.spellResolutionForm.duplicateOutcomeApplicationEffectId',
    () => 'Each effect can only be applied once per outcome.',
  ),
  halfNotSupportedForEffectKind: defineMessage<{ kind: string }>(
    'validation.spellResolutionForm.halfNotSupportedForEffectKind',
    ({ kind }) => `Half application is not supported for "${kind}" effects in this version.`,
  ),
}
