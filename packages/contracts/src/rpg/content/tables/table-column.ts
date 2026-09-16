import { z } from 'zod'

import { diceSchema } from '../../primitives/dice'
import { absoluteLevelSchema } from '../../primitives/level'
import { slugSchema } from '../lib/envelope'

import { progressionTableValidationMessages } from './progression-table-messages'

// ---------------------------------------------------------------------------
// Progression table columns — discriminated by persisted value shape.
// ---------------------------------------------------------------------------

export const TABLE_COLUMN_VALUE_TYPES = ['number', 'dice', 'text'] as const
export type TableColumnValueType = (typeof TABLE_COLUMN_VALUE_TYPES)[number]

export const TABLE_COLUMN_VALUE_TYPE_TERM = {
  label: 'Table Column Value Type',
  description: 'The persisted value shape for a progression column.',
  sentence: { singular: 'table column value type', plural: 'table column value types' },
} as const

export const TABLE_COLUMN_VALUE_TYPE_ENTRIES = {
  number: {
    label: 'Number',
    description: 'Numeric progression values such as uses, speed, or bonuses.',
  },
  dice: {
    label: 'Dice',
    description: 'Structured dice expressions such as martial arts die or inspiration die.',
  },
  text: {
    label: 'Text',
    description: 'Text progression values for reference columns.',
  },
} as const satisfies Record<TableColumnValueType, { label: string; description: string }>

export const TABLE_NUMBER_FORMATS = ['plain', 'signed'] as const
export type TableNumberFormat = (typeof TABLE_NUMBER_FORMATS)[number]

export const TABLE_NUMBER_FORMAT_TERM = {
  label: 'Table Number Format',
  description: 'Presentation format for numeric progression values.',
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
  value: z.number().finite(),
})

const diceProgressionTableEntrySchema = z.object({
  level: absoluteLevelSchema,
  value: diceSchema,
})

const textProgressionTableEntrySchema = z.object({
  level: absoluteLevelSchema,
  value: z.string().trim().min(1),
})

export const numberProgressionTableColumnSchema = z
  .object({
    id: slugSchema,
    label: z.string().trim().min(1),
    valueType: z.literal('number'),
    format: z.enum(TABLE_NUMBER_FORMATS).optional(),
    entries: z.array(numberProgressionTableEntrySchema).min(1),
  })
  .superRefine((column, ctx) => {
    refineAscendingEntryLevels(column.entries, ctx, ['entries'])
  })

export const diceProgressionTableColumnSchema = z
  .object({
    id: slugSchema,
    label: z.string().trim().min(1),
    valueType: z.literal('dice'),
    entries: z.array(diceProgressionTableEntrySchema).min(1),
  })
  .superRefine((column, ctx) => {
    refineAscendingEntryLevels(column.entries, ctx, ['entries'])
  })

export const textProgressionTableColumnSchema = z
  .object({
    id: slugSchema,
    label: z.string().trim().min(1),
    valueType: z.literal('text'),
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
