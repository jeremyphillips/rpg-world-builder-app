import { z } from 'zod'

import { slugSchema } from '../lib/envelope'

import { progressionTableValidationMessages } from './progression-table-messages'
import { progressionTableColumnSchema, type ProgressionTableColumn } from './table-column'

// ---------------------------------------------------------------------------
// Progression tables — structured reference/progression data.
// ---------------------------------------------------------------------------

export const PROGRESSION_TABLE_KINDS = ['levelProgression'] as const
export type ProgressionTableKind = (typeof PROGRESSION_TABLE_KINDS)[number]

export const PROGRESSION_TABLE_KIND_TERM = {
  label: 'Progression Table Kind',
  description: 'The progression model a structured table uses.',
  sentence: { singular: 'progression table kind', plural: 'progression table kinds' },
} as const

export const PROGRESSION_TABLE_KIND_ENTRIES = {
  levelProgression: {
    label: 'Level progression',
    description: 'Sparse per-level breakpoints with carry-forward semantics.',
  },
} as const satisfies Record<ProgressionTableKind, { label: string; description: string }>

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
        message: progressionTableValidationMessages.duplicateColumnId({ columnId: column.id }),
        path: [...pathPrefix, index, 'id'],
      })
    }
    seenIds.add(column.id)
  }
}

export const progressionTableSchema = z
  .object({
    id: slugSchema,
    name: z.string().trim().min(1),
    kind: z.enum(PROGRESSION_TABLE_KINDS),
    columns: z.array(progressionTableColumnSchema).min(1),
  })
  .superRefine((table, ctx) => {
    refineUniqueColumnIds(table.columns, ctx, ['columns'])
  })

export type ProgressionTable = z.infer<typeof progressionTableSchema>

/** Sorts progression entries ascending by level for explicit import normalization. */
export function normalizeProgressionTableColumnEntries<T extends ProgressionTableColumn>(
  column: T,
): T {
  const sortedEntries = [...column.entries].sort((left, right) => left.level - right.level)
  return { ...column, entries: sortedEntries } as T
}
