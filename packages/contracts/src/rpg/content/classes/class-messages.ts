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
}
