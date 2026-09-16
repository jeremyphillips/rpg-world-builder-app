import { defineMessage } from '../../../validation/define-message'

export const progressionTableValidationMessages = {
  duplicateColumnId: defineMessage<{ columnId: string }>(
    'validation.progressionTable.duplicateColumnId',
    ({ columnId }) => `Duplicate progression table column id "${columnId}".`,
  ),
  duplicateEntryLevel: defineMessage<{ level: number }>(
    'validation.progressionTable.duplicateEntryLevel',
    ({ level }) => `Duplicate progression entry for level ${level}.`,
  ),
  entriesNotAscending: defineMessage(
    'validation.progressionTable.entriesNotAscending',
    () => 'Progression entries must be sorted in strictly ascending order by level.',
  ),
}
