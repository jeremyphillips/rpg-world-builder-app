import { z } from 'zod'

import { levelSchema } from '../../primitives/level'
import { slugSchema } from '../lib/envelope'

import { featureTableValidationMessages } from './feature-table-messages'

// ---------------------------------------------------------------------------
// Feature tables — structured reference/progression data owned by a feature.
// ---------------------------------------------------------------------------

export const FEATURE_TABLE_KINDS = ['levelProgression'] as const
export type FeatureTableKind = (typeof FEATURE_TABLE_KINDS)[number]

export const FEATURE_TABLE_KIND_TERM = {
  label: 'Feature Table Kind',
  description: 'The progression model a feature-owned table uses.',
  sentence: { singular: 'feature table kind', plural: 'feature table kinds' },
} as const

export const FEATURE_TABLE_KIND_ENTRIES = {
  levelProgression: {
    label: 'Level progression',
    description: 'Sparse per-level breakpoints with carry-forward semantics.',
  },
} as const satisfies Record<FeatureTableKind, { label: string; description: string }>

export const FEATURE_TABLE_COLUMN_VALUE_TYPES = ['number', 'text'] as const
export type FeatureTableColumnValueType = (typeof FEATURE_TABLE_COLUMN_VALUE_TYPES)[number]

export const FEATURE_TABLE_COLUMN_VALUE_TYPE_TERM = {
  label: 'Feature Table Column Value Type',
  description: 'The persisted value shape for a progression column.',
  sentence: {
    singular: 'feature table column value type',
    plural: 'feature table column value types',
  },
} as const

export const FEATURE_TABLE_COLUMN_VALUE_TYPE_ENTRIES = {
  number: {
    label: 'Number',
    description: 'Numeric progression values such as uses, die size, or speed.',
  },
  text: {
    label: 'Text',
    description: 'Text progression values for future reference columns.',
  },
} as const satisfies Record<FeatureTableColumnValueType, { label: string; description: string }>

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
        message: featureTableValidationMessages.duplicateEntryLevel({ level: entry.level }),
        path: [...pathPrefix, index, 'level'],
      })
    }
    seenLevels.add(entry.level)

    if (index > 0) {
      const previous = entries[index - 1]
      if (previous && entry.level <= previous.level) {
        ctx.addIssue({
          code: 'custom',
          message: featureTableValidationMessages.entriesNotAscending(),
          path: [...pathPrefix, index, 'level'],
        })
      }
    }
  }
}

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
        message: featureTableValidationMessages.duplicateColumnId({ columnId: column.id }),
        path: [...pathPrefix, index, 'id'],
      })
    }
    seenIds.add(column.id)
  }
}

const numberFeatureTableEntrySchema = z.object({
  level: levelSchema,
  value: z.number().finite(),
})

const textFeatureTableEntrySchema = z.object({
  level: levelSchema,
  value: z.string().trim().min(1),
})

export const numberFeatureTableColumnSchema = z
  .object({
    id: slugSchema,
    label: z.string().trim().min(1),
    valueType: z.literal('number'),
    entries: z.array(numberFeatureTableEntrySchema).min(1),
  })
  .superRefine((column, ctx) => {
    refineAscendingEntryLevels(column.entries, ctx, ['entries'])
  })

export const textFeatureTableColumnSchema = z
  .object({
    id: slugSchema,
    label: z.string().trim().min(1),
    valueType: z.literal('text'),
    entries: z.array(textFeatureTableEntrySchema).min(1),
  })
  .superRefine((column, ctx) => {
    refineAscendingEntryLevels(column.entries, ctx, ['entries'])
  })

export const featureTableColumnSchema = z.discriminatedUnion('valueType', [
  numberFeatureTableColumnSchema,
  textFeatureTableColumnSchema,
])

export type FeatureTableColumn = z.infer<typeof featureTableColumnSchema>
export type NumberFeatureTableColumn = z.infer<typeof numberFeatureTableColumnSchema>
export type TextFeatureTableColumn = z.infer<typeof textFeatureTableColumnSchema>
export type FeatureTableEntry =
  | NumberFeatureTableColumn['entries'][number]
  | TextFeatureTableColumn['entries'][number]

export const featureTableSchema = z
  .object({
    id: slugSchema,
    name: z.string().trim().min(1),
    kind: z.enum(FEATURE_TABLE_KINDS),
    columns: z.array(featureTableColumnSchema).min(1),
  })
  .superRefine((table, ctx) => {
    refineUniqueColumnIds(table.columns, ctx, ['columns'])
  })

export type FeatureTable = z.infer<typeof featureTableSchema>

/** Sorts progression entries ascending by level for explicit import normalization. */
export function normalizeFeatureTableColumnEntries<T extends FeatureTableColumn>(column: T): T {
  const sortedEntries = [...column.entries].sort((left, right) => left.level - right.level)
  return { ...column, entries: sortedEntries } as T
}

export function refineFeatureTablesOnFeature(
  feature: { level: number; tables?: FeatureTable[] },
  ctx: z.RefinementCtx,
): void {
  const tables = feature.tables
  if (!tables?.length) return

  const seenTableIds = new Set<string>()

  for (const [tableIndex, table] of tables.entries()) {
    if (seenTableIds.has(table.id)) {
      ctx.addIssue({
        code: 'custom',
        message: featureTableValidationMessages.duplicateTableId({ tableId: table.id }),
        path: ['tables', tableIndex, 'id'],
      })
    }
    seenTableIds.add(table.id)

    for (const [columnIndex, column] of table.columns.entries()) {
      for (const [entryIndex, entry] of column.entries.entries()) {
        if (entry.level < feature.level) {
          ctx.addIssue({
            code: 'custom',
            message: featureTableValidationMessages.entryBeforeFeatureLevel({
              entryLevel: entry.level,
              featureLevel: feature.level,
            }),
            path: ['tables', tableIndex, 'columns', columnIndex, 'entries', entryIndex, 'level'],
          })
        }
      }
    }
  }
}
