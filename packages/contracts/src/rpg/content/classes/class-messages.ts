import { defineMessage } from '../../../validation/define-message'
import {
  getSlotProgressionKindLabel,
  PACT_MAGIC_SLOT_PROGRESSION_KIND_ID,
} from '../../vocab/spell/slot-progression-kind'

import { CLASS_FEATURE_KIND_ENTRIES } from './class'

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
    () => 'Spellcasting configuration requires a spellcasting feature row on the class.',
  ),
  spellcastingGrantRequiresConfig: defineMessage(
    'validation.class.spellcastingGrantRequiresConfig',
    () => 'A spellcasting feature row requires spellcasting configuration on the class.',
  ),
  spellcastingGrantingFeatureDuplicate: defineMessage(
    'validation.class.spellcastingGrantingFeatureDuplicate',
    () =>
      `Only one dedicated ${CLASS_FEATURE_KIND_ENTRIES.spellcasting.label} or ${getSlotProgressionKindLabel(PACT_MAGIC_SLOT_PROGRESSION_KIND_ID)} feature is allowed.`,
  ),
  duplicateClassFeatureId: defineMessage(
    'validation.class.duplicateClassFeatureId',
    () => 'Each class feature must have a unique id.',
  ),
  subclassChoiceFeatureDuplicate: defineMessage(
    'validation.class.subclassChoiceFeatureDuplicate',
    () => 'Only one subclass choice milestone is allowed per class.',
  ),
}
