import { z } from 'zod'

import { slugSchema } from '../lib/envelope'

import { generalTableValidationMessages } from './general-table-messages'
import {
  diceTableColumnDefSchema,
  numberTableColumnDefSchema,
  parseTableCellValue,
  tableColumnDefSchema,
  textTableColumnDefSchema,
  type TableColumnDef,
} from './table-column'

// ---------------------------------------------------------------------------
// General tables — dense row-major grids (no level axis or carry-forward).
// Spell description embeds reference these by id; contracts never parse HTML.
// ---------------------------------------------------------------------------

export const GENERAL_TABLE_KINDS = ['general'] as const
export type GeneralTableKind = (typeof GENERAL_TABLE_KINDS)[number]

export const GENERAL_TABLE_KIND_TERM = {
  label: 'General Table Kind',
  description: 'A dense authored-order table without level progression semantics.',
  sentence: { singular: 'general table kind', plural: 'general table kinds' },
} as const

export const GENERAL_TABLE_KIND_ENTRIES = {
  general: {
    label: 'General',
    description: 'Authored-order rows with optional blank cells.',
  },
} as const satisfies Record<GeneralTableKind, { label: string; description: string }>

function refineUniqueColumnIds(
  columns: readonly { id: string }[],
  ctx: z.RefinementCtx,
  pathPrefix: PropertyKey[],
): void {
  const seenIds = new Set<string>()

  for (const [index, column] of columns.entries()) {
    if (seenIds.has(column.id)) {
      ctx.addIssue({
        code: 'custom',
        message: generalTableValidationMessages.duplicateColumnId({ columnId: column.id }),
        path: [...pathPrefix, index, 'id'],
      })
    }
    seenIds.add(column.id)
  }
}

function refineUniqueRowIds(
  rows: readonly { id: string }[],
  ctx: z.RefinementCtx,
  pathPrefix: PropertyKey[],
): void {
  const seenIds = new Set<string>()

  for (const [index, row] of rows.entries()) {
    if (seenIds.has(row.id)) {
      ctx.addIssue({
        code: 'custom',
        message: generalTableValidationMessages.duplicateRowId({ rowId: row.id }),
        path: [...pathPrefix, index, 'id'],
      })
    }
    seenIds.add(row.id)
  }
}

function refineRowCells(
  row: { cells: Record<string, unknown> },
  columnsById: Map<string, TableColumnDef>,
  ctx: z.RefinementCtx,
  pathPrefix: PropertyKey[],
): void {
  for (const [columnId, rawValue] of Object.entries(row.cells)) {
    const column = columnsById.get(columnId)
    if (column === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: generalTableValidationMessages.unknownCellColumnId({ columnId }),
        path: [...pathPrefix, 'cells', columnId],
      })
      continue
    }

    const parsed = parseTableCellValue(column, rawValue)
    if (parsed === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: generalTableValidationMessages.invalidCellValue({ columnId }),
        path: [...pathPrefix, 'cells', columnId],
      })
    }
  }
}

export const generalTableRowSchema = z.object({
  id: slugSchema,
  cells: z.record(z.string(), z.unknown()),
})

export type GeneralTableRow = z.infer<typeof generalTableRowSchema>

export const generalTableSchema = z
  .object({
    id: slugSchema,
    name: z.string().trim().min(1),
    kind: z.enum(GENERAL_TABLE_KINDS),
    columns: z.array(tableColumnDefSchema).min(1),
    rows: z.array(generalTableRowSchema).min(1),
  })
  .superRefine((table, ctx) => {
    refineUniqueColumnIds(table.columns, ctx, ['columns'])
    refineUniqueRowIds(table.rows, ctx, ['rows'])

    const columnsById = new Map(table.columns.map((column) => [column.id, column]))
    for (const [index, row] of table.rows.entries()) {
      refineRowCells(row, columnsById, ctx, ['rows', index])
    }
  })

export type GeneralTable = z.infer<typeof generalTableSchema>

export { numberTableColumnDefSchema, diceTableColumnDefSchema, textTableColumnDefSchema }
