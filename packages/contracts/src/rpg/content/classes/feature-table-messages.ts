import { defineMessage } from '../../../validation/define-message'

export const featureTableValidationMessages = {
  duplicateTableId: defineMessage<{ tableId: string }>(
    'validation.featureTable.duplicateTableId',
    ({ tableId }) => `Duplicate feature table id "${tableId}".`,
  ),
  duplicateColumnId: defineMessage<{ columnId: string }>(
    'validation.featureTable.duplicateColumnId',
    ({ columnId }) => `Duplicate feature table column id "${columnId}".`,
  ),
  duplicateEntryLevel: defineMessage<{ level: number }>(
    'validation.featureTable.duplicateEntryLevel',
    ({ level }) => `Duplicate progression entry for level ${level}.`,
  ),
  entriesNotAscending: defineMessage(
    'validation.featureTable.entriesNotAscending',
    () => 'Progression entries must be sorted in strictly ascending order by level.',
  ),
  entryBeforeFeatureLevel: defineMessage<{ entryLevel: number; featureLevel: number }>(
    'validation.featureTable.entryBeforeFeatureLevel',
    ({ entryLevel, featureLevel }) =>
      `Progression entry level (${entryLevel}) must be at or after the owning feature level (${featureLevel}).`,
  ),
}
