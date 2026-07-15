import { defineMessage } from '../../../../../validation/define-message'

// ---------------------------------------------------------------------------
// Spell resolution progression validation messages (tier 2).
// ---------------------------------------------------------------------------

export const spellResolutionProgressionValidationMessages = {
  basisRequiresCantripLevel: defineMessage(
    'validation.spellResolutionProgression.basisRequiresCantripLevel',
    () => 'Character-level progression is only allowed on cantrips (level 0).',
  ),
  basisRequiresLeveledSpell: defineMessage(
    'validation.spellResolutionProgression.basisRequiresLeveledSpell',
    () => 'Spell-slot-level progression is only allowed on leveled spells (level 1–9).',
  ),
  tracksRequired: defineMessage(
    'validation.spellResolutionProgression.tracksRequired',
    () => 'Add at least one progression track.',
  ),
  invalidSubjectPropertyPair: defineMessage<{ subject: string; property: string }>(
    'validation.spellResolutionProgression.invalidSubjectPropertyPair',
    ({ subject, property }) => `Property "${property}" is not valid for subject "${subject}".`,
  ),
  unknownEffectReference: defineMessage<{ effectId: string }>(
    'validation.spellResolutionProgression.unknownEffectReference',
    ({ effectId }) => `Progression references unknown effect "${effectId}".`,
  ),
  effectMustBeRollBearing: defineMessage<{ effectId: string }>(
    'validation.spellResolutionProgression.effectMustBeRollBearing',
    ({ effectId }) => `Effect "${effectId}" does not support roll progression.`,
  ),
  applicationPatternProjectilesRequired: defineMessage(
    'validation.spellResolutionProgression.applicationPatternProjectilesRequired',
    () => 'Projectile-count progression requires an application pattern of kind "projectiles".',
  ),
  targetRequiredForTargetCount: defineMessage(
    'validation.spellResolutionProgression.targetRequiredForTargetCount',
    () => 'Selected-target-count progression requires a configured target.',
  ),
  valueKindMismatch: defineMessage<{ expected: string; actual: string }>(
    'validation.spellResolutionProgression.valueKindMismatch',
    ({ expected, actual }) => `Expected a ${expected} value but received ${actual}.`,
  ),
  thresholdsMustAscend: defineMessage(
    'validation.spellResolutionProgression.thresholdsMustAscend',
    () => 'Threshold entries must be in strictly ascending order without duplicates.',
  ),
  cantripThresholdsMustMatchRuleset: defineMessage<{ expected: string }>(
    'validation.spellResolutionProgression.cantripThresholdsMustMatchRuleset',
    ({ expected }) =>
      `Character-level thresholds must match the active ruleset tiers (${expected}).`,
  ),
  incrementMustBePositive: defineMessage(
    'validation.spellResolutionProgression.incrementMustBePositive',
    () => 'Linear increment must be strictly positive.',
  ),
  incrementDiceFacesMustMatchBase: defineMessage(
    'validation.spellResolutionProgression.incrementDiceFacesMustMatchBase',
    () => 'Roll increment dice must use the same die faces as the base roll.',
  ),
  flatOnlyIncrementNotSupported: defineMessage(
    'validation.spellResolutionProgression.flatOnlyIncrementNotSupported',
    () => 'Flat-only slot increments are not supported in this version.',
  ),
  thresholdEntriesRequired: defineMessage(
    'validation.spellResolutionProgression.thresholdEntriesRequired',
    () => 'Add at least one threshold entry.',
  ),
}
