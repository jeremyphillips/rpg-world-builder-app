import { TABLE_COLUMN_VALUE_TYPES, TABLE_NUMBER_FORMATS, defineMessage } from '@rpg/contracts'
import { z } from 'zod'

import {
  isTableBuilderCellBlank,
  parseDiceCellDraft,
  parseLevelDraft,
  parseNumberCellDraft,
  type TableBuilderColumnDraft,
  type TableBuilderFormValues,
} from './table-builder-draft'

export const tableBuilderValidationMessages = {
  tableName: defineMessage('validation.tableBuilder.tableName', () => 'Enter a table name.'),
  columnName: defineMessage('validation.tableBuilder.columnName', () => 'Enter a column name.'),
  minColumns: defineMessage('validation.tableBuilder.minColumns', () => 'Add at least one column.'),
  minRows: defineMessage('validation.tableBuilder.minRows', () => 'Add at least one row.'),
  chooseLevel: defineMessage('validation.tableBuilder.chooseLevel', () => 'Choose a level.'),
  duplicateLevel: defineMessage<{ level: number }>(
    'validation.tableBuilder.duplicateLevel',
    ({ level }) => `Level ${level} is already used.`,
  ),
  invalidNumber: defineMessage('validation.tableBuilder.invalidNumber', () => 'Enter a number.'),
  invalidDice: defineMessage(
    'validation.tableBuilder.invalidDice',
    () => 'Enter a valid dice value.',
  ),
  columnNeedsValue: defineMessage<{ label: string }>(
    'validation.tableBuilder.columnNeedsValue',
    ({ label }) => `${label} needs a value in at least one row.`,
  ),
}

const diceCellDraftSchema = z.object({
  count: z.string().optional(),
  faces: z.string().optional(),
})

const cellDraftSchema = z.union([z.string(), diceCellDraftSchema])

const columnDraftSchema = z.object({
  key: z.string().min(1),
  id: z.string().min(1).optional(),
  label: z.string(),
  valueType: z.enum(TABLE_COLUMN_VALUE_TYPES),
  format: z.enum(TABLE_NUMBER_FORMATS),
})

const rowDraftSchema = z.object({
  level: z.string(),
  cells: z.record(z.string(), cellDraftSchema.optional()),
})

function refineCell(
  column: TableBuilderColumnDraft,
  cell: TableBuilderFormValues['rows'][number]['cells'][string],
  path: PropertyKey[],
  ctx: z.RefinementCtx,
): boolean {
  if (cell === undefined || isTableBuilderCellBlank(cell)) return false

  if (column.valueType === 'number') {
    if (typeof cell !== 'string' || parseNumberCellDraft(cell) === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: tableBuilderValidationMessages.invalidNumber(),
        path,
      })
      return false
    }
    return true
  }

  if (column.valueType === 'dice') {
    if (typeof cell === 'string' || parseDiceCellDraft(cell) === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: tableBuilderValidationMessages.invalidDice(),
        path,
      })
      return false
    }
    return true
  }

  return typeof cell === 'string' && cell.trim() !== ''
}

function refineStructure(values: TableBuilderFormValues, ctx: z.RefinementCtx): void {
  if (values.name.trim() === '') {
    ctx.addIssue({
      code: 'custom',
      message: tableBuilderValidationMessages.tableName(),
      path: ['name'],
    })
  }

  if (values.columns.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: tableBuilderValidationMessages.minColumns(),
      path: ['columns'],
    })
  }

  if (values.rows.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: tableBuilderValidationMessages.minRows(),
      path: ['rows'],
    })
  }
}

function refineColumnLabels(values: TableBuilderFormValues, ctx: z.RefinementCtx): void {
  for (const [index, column] of values.columns.entries()) {
    if (column.label.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: tableBuilderValidationMessages.columnName(),
        path: ['columns', index, 'label'],
      })
    }
  }
}

function refineRowLevels(values: TableBuilderFormValues, ctx: z.RefinementCtx): void {
  const seenLevels = new Set<number>()

  for (const [rowIndex, row] of values.rows.entries()) {
    const level = parseLevelDraft(row.level)

    if (level === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: tableBuilderValidationMessages.chooseLevel(),
        path: ['rows', rowIndex, 'level'],
      })
      continue
    }

    if (seenLevels.has(level)) {
      ctx.addIssue({
        code: 'custom',
        message: tableBuilderValidationMessages.duplicateLevel({ level }),
        path: ['rows', rowIndex, 'level'],
      })
    }
    seenLevels.add(level)
  }
}

function refineColumnCells(values: TableBuilderFormValues, ctx: z.RefinementCtx): void {
  for (const [columnIndex, column] of values.columns.entries()) {
    let hasValue = false

    for (const [rowIndex, row] of values.rows.entries()) {
      const valid = refineCell(
        column,
        row.cells[column.key],
        ['rows', rowIndex, 'cells', column.key],
        ctx,
      )
      if (valid) hasValue = true
    }

    if (!hasValue && column.label.trim() !== '') {
      ctx.addIssue({
        code: 'custom',
        message: tableBuilderValidationMessages.columnNeedsValue({ label: column.label.trim() }),
        path: ['columns', columnIndex, 'label'],
      })
    }
  }
}

function refineTableBuilderForm(values: TableBuilderFormValues, ctx: z.RefinementCtx): void {
  refineStructure(values, ctx)
  refineColumnLabels(values, ctx)
  refineRowLevels(values, ctx)
  refineColumnCells(values, ctx)
}

/** Validates the authoring draft on save; blank cells are legitimate carry-forward gaps. */
export const tableBuilderFormSchema = z
  .object({
    name: z.string(),
    columns: z.array(columnDraftSchema),
    rows: z.array(rowDraftSchema),
  })
  .superRefine(refineTableBuilderForm)
