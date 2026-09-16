import { defineMessage } from '../../../validation/define-message'

export const classFeatureTableValidationMessages = {
  duplicateTableId: defineMessage<{ tableId: string }>(
    'validation.classFeatureTable.duplicateTableId',
    ({ tableId }) => `Duplicate feature table id "${tableId}".`,
  ),
  entryBeforeFeatureLevel: defineMessage<{ entryLevel: number; featureLevel: number }>(
    'validation.classFeatureTable.entryBeforeFeatureLevel',
    ({ entryLevel, featureLevel }) =>
      `Progression entry level (${entryLevel}) must be at or after the owning feature level (${featureLevel}).`,
  ),
}
