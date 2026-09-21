import { defineMessage } from '../../../validation/define-message'

// ---------------------------------------------------------------------------
// Class feature validation messages (tier 2).
// ---------------------------------------------------------------------------

export const classValidationMessages = {
  grantGroupUnlockAfterFeatureLevel: defineMessage<{ unlockLevel: number; featureLevel: number }>(
    'validation.class.grantGroupUnlockAfterFeatureLevel',
    ({ unlockLevel, featureLevel }) =>
      `Grant unlock level (${unlockLevel}) must be higher than the feature level (${featureLevel}).`,
  ),
  spellcastingConfigRequiresGrant: defineMessage(
    'validation.class.spellcastingConfigRequiresGrant',
    () =>
      'Spellcasting configuration requires a dedicated Spellcasting feature with a spellcasting grant.',
  ),
  spellcastingGrantRequiresConfig: defineMessage(
    'validation.class.spellcastingGrantRequiresConfig',
    () => 'A spellcasting grant requires spellcasting configuration on the class.',
  ),
  spellcastingGrantingFeatureDuplicate: defineMessage(
    'validation.class.spellcastingGrantingFeatureDuplicate',
    () => 'Only one dedicated Spellcasting or Pact Magic feature is allowed.',
  ),
  spellcastingGrantingFeatureInvalid: defineMessage(
    'validation.class.spellcastingGrantingFeatureInvalid',
    () =>
      'The Spellcasting feature must contain exactly one default grant group with only a spellcasting grant.',
  ),
}
