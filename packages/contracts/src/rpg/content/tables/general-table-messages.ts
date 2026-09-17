import { defineMessage } from '../../../validation/define-message'

export const generalTableValidationMessages = {
  duplicateColumnId: defineMessage<{ columnId: string }>(
    'validation.generalTable.duplicateColumnId',
    ({ columnId }) => `Duplicate general table column id "${columnId}".`,
  ),
  duplicateRowId: defineMessage<{ rowId: string }>(
    'validation.generalTable.duplicateRowId',
    ({ rowId }) => `Duplicate general table row id "${rowId}".`,
  ),
  unknownCellColumnId: defineMessage<{ columnId: string }>(
    'validation.generalTable.unknownCellColumnId',
    ({ columnId }) => `Unknown column id "${columnId}" in row cells.`,
  ),
  invalidCellValue: defineMessage<{ columnId: string }>(
    'validation.generalTable.invalidCellValue',
    ({ columnId }) => `Cell value for column "${columnId}" does not match its type.`,
  ),
}
