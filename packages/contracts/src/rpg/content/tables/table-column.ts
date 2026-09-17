import { z } from 'zod'

import { diceSchema } from '../../primitives/dice'
import { absoluteLevelSchema } from '../../primitives/level'
import { slugSchema } from '../lib/envelope'

import { progressionTableValidationMessages } from './progression-table-messages'

// ---------------------------------------------------------------------------
// Shared table column defs and typed cell values (number | dice | text).
// Progression columns compose a def with sparse level-keyed entries.
// ---------------------------------------------------------------------------

export const TABLE_COLUMN_VALUE_TYPES = ['number', 'dice', 'text'] as const
export type TableColumnValueType = (typeof TABLE_COLUMN_VALUE_TYPES)[number]

export const TABLE_COLUMN_VALUE_TYPE_TERM = {
  label: 'Table Column Value Type',
  description: 'The persisted value shape for a table column.',
  sentence: { singular: 'table column value type', plural: 'table column value types' },
} as const

export const TABLE_COLUMN_VALUE_TYPE_ENTRIES = {
  number: {
    label: 'Number',
    description: 'Numeric values such as uses, speed, bonuses, or roll results.',
  },
  dice: {
    label: 'Dice',
    description: 'Structured dice expressions such as martial arts die or inspiration die.',
  },
  text: {
    label: 'Text',
    description: 'Text values for reference columns.',
  },
} as const satisfies Record<TableColumnValueType, { label: string; description: string }>

export const TABLE_NUMBER_FORMATS = ['plain', 'signed'] as const
export type TableNumberFormat = (typeof TABLE_NUMBER_FORMATS)[number]

export const TABLE_NUMBER_FORMAT_TERM = {
  label: 'Table Number Format',
  description: 'Presentation format for numeric table values.',
  sentence: { singular: 'table number format', plural: 'table number formats' },
} as const

export const TABLE_NUMBER_FORMAT_ENTRIES = {
  plain: {
    label: 'Plain',
    description: 'Display the number as written.',
  },
  signed: {
    label: 'Signed (+2)',
    description: 'Prefix positive numbers with a plus sign.',
  },
} as const satisfies Record<TableNumberFormat, { label: string; description: string }>

export const tableNumberCellValueSchema = z.number().finite()
export const tableDiceCellValueSchema = diceSchema
export const tableTextCellValueSchema = z.string().trim().min(1)

export type TableNumberCellValue = z.infer<typeof tableNumberCellValueSchema>
export type TableDiceCellValue = z.infer<typeof tableDiceCellValueSchema>
export type TableTextCellValue = z.infer<typeof tableTextCellValueSchema>
export type TableCellValue = TableNumberCellValue | TableDiceCellValue | TableTextCellValue

export const numberTableColumnDefSchema = z.object({
  id: slugSchema,
  label: z.string().trim().min(1),
  valueType: z.literal('number'),
  format: z.enum(TABLE_NUMBER_FORMATS).optional(),
})

export const diceTableColumnDefSchema = z.object({
  id: slugSchema,
  label: z.string().trim().min(1),
  valueType: z.literal('dice'),
})

export const textTableColumnDefSchema = z.object({
  id: slugSchema,
  label: z.string().trim().min(1),
  valueType: z.literal('text'),
})

export const tableColumnDefSchema = z.discriminatedUnion('valueType', [
  numberTableColumnDefSchema,
  diceTableColumnDefSchema,
  textTableColumnDefSchema,
])

export type NumberTableColumnDef = z.infer<typeof numberTableColumnDefSchema>
export type DiceTableColumnDef = z.infer<typeof diceTableColumnDefSchema>
export type TextTableColumnDef = z.infer<typeof textTableColumnDefSchema>
export type TableColumnDef = z.infer<typeof tableColumnDefSchema>

/** Parses a raw cell value against a column def; returns undefined when invalid. */
export function parseTableCellValue(
  column: TableColumnDef,
  rawValue: unknown,
): TableCellValue | undefined {
  switch (column.valueType) {
    case 'number': {
      const result = tableNumberCellValueSchema.safeParse(rawValue)
      return result.success ? result.data : undefined
    }
    case 'dice': {
      const result = tableDiceCellValueSchema.safeParse(rawValue)
      return result.success ? result.data : undefined
    }
    case 'text': {
      const result = tableTextCellValueSchema.safeParse(rawValue)
      return result.success ? result.data : undefined
    }
  }
}

function refineAscendingEntryLevels(
  entries: readonly { level: number }[],
  ctx: z.RefinementCtx,
  pathPrefix: PropertyKey[],
): void {
  const seenLevels = new Set<number>()

  for (const [index, entry] of entries.entries()) {
    if (seenLevels.has(entry.level)) {
      ctx.addIssue({
        code: 'custom',
        message: progressionTableValidationMessages.duplicateEntryLevel({ level: entry.level }),
        path: [...pathPrefix, index, 'level'],
      })
    }
    seenLevels.add(entry.level)

    if (index > 0) {
      const previous = entries[index - 1]
      if (previous && entry.level <= previous.level) {
        ctx.addIssue({
          code: 'custom',
          message: progressionTableValidationMessages.entriesNotAscending(),
          path: [...pathPrefix, index, 'level'],
        })
      }
    }
  }
}

const numberProgressionTableEntrySchema = z.object({
  level: absoluteLevelSchema,
  value: tableNumberCellValueSchema,
})

const diceProgressionTableEntrySchema = z.object({
  level: absoluteLevelSchema,
  value: tableDiceCellValueSchema,
})

const textProgressionTableEntrySchema = z.object({
  level: absoluteLevelSchema,
  value: tableTextCellValueSchema,
})

export const numberProgressionTableColumnSchema = numberTableColumnDefSchema
  .extend({
    entries: z.array(numberProgressionTableEntrySchema).min(1),
  })
  .superRefine((column, ctx) => {
    refineAscendingEntryLevels(column.entries, ctx, ['entries'])
  })

export const diceProgressionTableColumnSchema = diceTableColumnDefSchema
  .extend({
    entries: z.array(diceProgressionTableEntrySchema).min(1),
  })
  .superRefine((column, ctx) => {
    refineAscendingEntryLevels(column.entries, ctx, ['entries'])
  })

export const textProgressionTableColumnSchema = textTableColumnDefSchema
  .extend({
    entries: z.array(textProgressionTableEntrySchema).min(1),
  })
  .superRefine((column, ctx) => {
    refineAscendingEntryLevels(column.entries, ctx, ['entries'])
  })

export const progressionTableColumnSchema = z.discriminatedUnion('valueType', [
  numberProgressionTableColumnSchema,
  diceProgressionTableColumnSchema,
  textProgressionTableColumnSchema,
])

export type ProgressionTableColumn = z.infer<typeof progressionTableColumnSchema>
export type NumberProgressionTableColumn = z.infer<typeof numberProgressionTableColumnSchema>
export type DiceProgressionTableColumn = z.infer<typeof diceProgressionTableColumnSchema>
export type TextProgressionTableColumn = z.infer<typeof textProgressionTableColumnSchema>
export type ProgressionTableEntry =
  | NumberProgressionTableColumn['entries'][number]
  | DiceProgressionTableColumn['entries'][number]
  | TextProgressionTableColumn['entries'][number]
