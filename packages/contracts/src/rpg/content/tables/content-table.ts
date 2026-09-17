import { z } from 'zod'

import { generalTableSchema, type GeneralTable } from './general-table'
import { progressionTableSchema, type ProgressionTable } from './progression-table'

// ---------------------------------------------------------------------------
// Content tables — discriminated union for hosts that accept both progression
// and general table shapes (e.g. class feature tables[]).
// ---------------------------------------------------------------------------

export const contentTableSchema = z.discriminatedUnion('kind', [
  progressionTableSchema,
  generalTableSchema,
])

export type ContentTable = z.infer<typeof contentTableSchema>

export type ContentTableKind = ContentTable['kind']

export function isProgressionContentTable(table: ContentTable): table is ProgressionTable {
  return table.kind === 'levelProgression'
}

export function isGeneralContentTable(table: ContentTable): table is GeneralTable {
  return table.kind === 'general'
}
