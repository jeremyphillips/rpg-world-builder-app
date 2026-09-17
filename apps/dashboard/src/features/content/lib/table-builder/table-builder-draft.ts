import {
  DIE_FACES,
  dedupeContentKey,
  deriveContentKey,
  formatProgressionTableValue,
  type Dice,
  type ProgressionTable,
  type ProgressionTableColumn,
  type TableColumnValueType,
  type TableNumberFormat,
} from '@rpg/contracts'

import type { ProgressionTablePresentation } from '../../components/tables/progression-table-presentation'
import type { TableBuilderKind } from './table-builder-kind'

// ---------------------------------------------------------------------------
// Row-major authoring draft for the table builder, mapped to and from the
// column-owned sparse persistence shape (`ProgressionTable`) or dense
// general-table rows.
//
// Identity rule: `key` is an ephemeral authoring identity (React lists, cell
// addressing, drag reorder) and is NEVER persisted. Progression column ids are
// derived from the label once when first saved; general ids are opaque UUIDs.
// ---------------------------------------------------------------------------

/** @deprecated Use `tableBuilderCapabilities.levelProgression` from `table-builder-kind`. */
export const progressionTableBuilderCapabilities = {
  axis: 'level',
  rowReorder: false,
} as const

export type TableBuilderDiceCellDraft = {
  /** May be absent while RHF registers count/faces independently mid-edit. */
  count?: string
  faces?: string
}

/** Raw cell editing value — string for number/text columns, count+faces for dice. */
export type TableBuilderCellDraft = string | TableBuilderDiceCellDraft

export type TableBuilderColumnDraft = {
  /** Ephemeral authoring identity — never persisted. */
  key: string
  /** Stable persisted id; absent for columns created in this session until save. */
  id?: string
  label: string
  valueType: TableColumnValueType
  /** Presentation format for number columns; ignored for other value types. */
  format: TableNumberFormat
}

export type TableBuilderRowDraft = {
  /** Ephemeral authoring identity for general rows. */
  key?: string
  /** Stable persisted id for general rows. */
  id?: string
  /** Level axis for progression tables. */
  level?: string
  cells: Record<string, TableBuilderCellDraft | undefined>
}

export type TableBuilderFormValues = {
  kind: TableBuilderKind
  name: string
  columns: TableBuilderColumnDraft[]
  rows: TableBuilderRowDraft[]
}

export function createTableBuilderColumnKey(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `column-${Math.random().toString(36).slice(2)}`
}

export function createTableBuilderRowKey(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `row-${Math.random().toString(36).slice(2)}`
}

export function createTableBuilderColumnDraft(): TableBuilderColumnDraft {
  return {
    key: createTableBuilderColumnKey(),
    label: '',
    valueType: 'number',
    format: 'plain',
  }
}

export function createEmptyTableBuilderDraft(
  kind: TableBuilderKind = 'levelProgression',
): TableBuilderFormValues {
  return { kind, name: '', columns: [], rows: [] }
}

export function emptyCellDraftForValueType(valueType: TableColumnValueType): TableBuilderCellDraft {
  return valueType === 'dice' ? { count: '', faces: '' } : ''
}

/** Display fallback for unnamed draft columns — never the ephemeral `key`. */
export function tableBuilderColumnFallbackLabel(index: number): string {
  return `Column ${index + 1}`
}

export function isTableBuilderCellBlank(cell: TableBuilderCellDraft | undefined): boolean {
  if (cell === undefined) return true
  if (typeof cell === 'string') return cell.trim() === ''
  return (cell.count ?? '').trim() === '' && (cell.faces ?? '').trim() === ''
}

// ---------------------------------------------------------------------------
// Cell parsing — draft strings to persisted values. Blank cells return
// undefined (carry-forward); unparseable cells also return undefined and are
// rejected by the form schema before save.
// ---------------------------------------------------------------------------

export function parseLevelDraft(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (trimmed === '') return undefined
  const value = Number(trimmed)
  return Number.isInteger(value) && value > 0 ? value : undefined
}

export function parseNumberCellDraft(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (trimmed === '') return undefined
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : undefined
}

export function parseDiceCellDraft(cell: TableBuilderDiceCellDraft): Dice | undefined {
  const count = Number((cell.count ?? '').trim())
  const faces = Number((cell.faces ?? '').trim())
  if (!Number.isInteger(count) || count < 1) return undefined
  if (!(DIE_FACES as readonly number[]).includes(faces)) return undefined
  return { count, faces: faces as Dice['faces'] }
}

type ParsedCellValue = number | string | Dice

export function parseCellDraft(
  column: Pick<TableBuilderColumnDraft, 'valueType'>,
  cell: TableBuilderCellDraft | undefined,
): ParsedCellValue | undefined {
  if (cell === undefined || isTableBuilderCellBlank(cell)) return undefined

  switch (column.valueType) {
    case 'number':
      return typeof cell === 'string' ? parseNumberCellDraft(cell) : undefined
    case 'dice':
      return typeof cell === 'string' ? undefined : parseDiceCellDraft(cell)
    case 'text':
      return typeof cell === 'string' ? cell.trim() : undefined
  }
}

// ---------------------------------------------------------------------------
// Persistence mapping
// ---------------------------------------------------------------------------

function diceCellDraftFromValue(value: Dice): TableBuilderDiceCellDraft {
  return { count: String(value.count), faces: String(value.faces) }
}

function cellDraftFromEntryValue(
  column: ProgressionTableColumn,
  value: number | string | Dice,
): TableBuilderCellDraft {
  switch (column.valueType) {
    case 'number':
      return String(value)
    case 'dice':
      return diceCellDraftFromValue(value as Dice)
    case 'text':
      return String(value)
  }
}

/** Inverts a persisted table into the sparse row-major authoring draft. */
export function tableToDraft(table: ProgressionTable): TableBuilderFormValues {
  const columns: TableBuilderColumnDraft[] = table.columns.map((column) => ({
    key: createTableBuilderColumnKey(),
    id: column.id,
    label: column.label,
    valueType: column.valueType,
    format: column.valueType === 'number' ? (column.format ?? 'plain') : 'plain',
  }))

  const breakpoints = new Set<number>()
  for (const column of table.columns) {
    for (const entry of column.entries) {
      breakpoints.add(entry.level)
    }
  }

  const rows: TableBuilderRowDraft[] = [...breakpoints]
    .sort((left, right) => left - right)
    .map((level) => {
      const cells: Record<string, TableBuilderCellDraft | undefined> = {}
      table.columns.forEach((column, index) => {
        const entry = column.entries.find((candidate) => candidate.level === level)
        const draftColumn = columns[index]
        if (entry === undefined || draftColumn === undefined) return
        cells[draftColumn.key] = cellDraftFromEntryValue(column, entry.value)
      })
      return { level: String(level), cells }
    })

  return { kind: 'levelProgression', name: table.name, columns, rows }
}

type DraftToTableOptions = {
  /** Preserves the persisted table id on edit; new tables derive one from the name. */
  existingTable?: Pick<ProgressionTable, 'id'>
}

function resolveColumnId(column: TableBuilderColumnDraft, usedIds: Set<string>): string {
  const id = column.id ?? dedupeContentKey(deriveContentKey(column.label), usedIds)
  usedIds.add(id)
  return id
}

function buildColumnEntries(
  column: TableBuilderColumnDraft,
  rows: readonly TableBuilderRowDraft[],
): Array<{ level: number; value: ParsedCellValue }> {
  const entries: Array<{ level: number; value: ParsedCellValue }> = []

  for (const row of rows) {
    const level = parseLevelDraft(row.level ?? '')
    if (level === undefined) continue
    const value = parseCellDraft(column, row.cells[column.key])
    if (value === undefined) continue
    entries.push({ level, value })
  }

  return entries.sort((left, right) => left.level - right.level)
}

/**
 * Maps a validated draft to the persisted column-owned shape. Blank cells emit
 * no entries — carry-forward values are never fabricated.
 */
export function draftToTable(
  values: TableBuilderFormValues,
  options: DraftToTableOptions = {},
): ProgressionTable {
  const usedIds = new Set<string>(
    values.columns.flatMap((column) => (column.id !== undefined ? [column.id] : [])),
  )

  const columns = values.columns.map((column): ProgressionTableColumn => {
    const id = resolveColumnId(column, usedIds)
    const label = column.label.trim()
    const entries = buildColumnEntries(column, values.rows)

    switch (column.valueType) {
      case 'number':
        return {
          id,
          label,
          valueType: 'number',
          ...(column.format === 'signed' ? { format: 'signed' as const } : {}),
          entries: entries as Array<{ level: number; value: number }>,
        }
      case 'dice':
        return {
          id,
          label,
          valueType: 'dice',
          entries: entries as Array<{ level: number; value: Dice }>,
        }
      case 'text':
        return {
          id,
          label,
          valueType: 'text',
          entries: entries as Array<{ level: number; value: string }>,
        }
    }
  })

  return {
    id: options.existingTable?.id ?? deriveContentKey(values.name),
    name: values.name.trim(),
    kind: 'levelProgression' as const,
    columns,
  }
}

// ---------------------------------------------------------------------------
// Preview projection — tolerant of incomplete drafts. Never claims to be a
// valid ProgressionTable; produces the display-only presentation model.
// ---------------------------------------------------------------------------

function formatParsedCellValue(
  column: Pick<TableBuilderColumnDraft, 'valueType' | 'format'>,
  value: ParsedCellValue,
): string {
  const pseudoColumn = {
    valueType: column.valueType,
    ...(column.valueType === 'number' && column.format === 'signed'
      ? { format: 'signed' as const }
      : {}),
  } as ProgressionTableColumn

  return formatProgressionTableValue(pseudoColumn, value)
}

/**
 * Best-effort preview of the authoring draft: resolved carry-forward output for
 * parseable cells, `undefined` (em dash) for unresolved ones.
 */
export function draftToPresentation(values: TableBuilderFormValues): ProgressionTablePresentation {
  const trimmedName = values.name.trim()

  const parsedEntriesByColumnKey = new Map<
    string,
    Array<{ level: number; value: ParsedCellValue }>
  >()
  for (const column of values.columns) {
    parsedEntriesByColumnKey.set(column.key, buildColumnEntries(column, values.rows))
  }

  const rowsWithLevels = values.rows.map((row) => ({
    row,
    level: parseLevelDraft(row.level ?? ''),
  }))

  const sortedRows = [...rowsWithLevels.filter((entry) => entry.level !== undefined)].sort(
    (left, right) => (left.level ?? 0) - (right.level ?? 0),
  )
  const unleveledRows = rowsWithLevels.filter((entry) => entry.level === undefined)

  return {
    ...(trimmedName === '' ? {} : { name: trimmedName }),
    columns: values.columns.map((column, index) => {
      const label = column.label.trim()
      return {
        key: column.key,
        label: label === '' ? tableBuilderColumnFallbackLabel(index) : label,
      }
    }),
    rows: [...sortedRows, ...unleveledRows].map(({ row, level }) => ({
      ...(level === undefined ? {} : { level }),
      values: Object.fromEntries(
        values.columns.map((column) => {
          if (level === undefined) {
            const direct = parseCellDraft(column, row.cells[column.key])
            return [
              column.key,
              direct === undefined ? undefined : formatParsedCellValue(column, direct),
            ]
          }

          const entries = parsedEntriesByColumnKey.get(column.key) ?? []
          let resolved: ParsedCellValue | undefined
          for (const entry of entries) {
            if (entry.level <= level) resolved = entry.value
          }
          return [
            column.key,
            resolved === undefined ? undefined : formatParsedCellValue(column, resolved),
          ]
        }),
      ),
    })),
  }
}

// ---------------------------------------------------------------------------
// Row ordering — rows sort by level (no manual row reorder for level
// progression). Returns the `move` needed after a level change, or undefined
// when no move is required or some levels are still unset.
// ---------------------------------------------------------------------------

export function resolveRowSortMove(
  levels: readonly (number | undefined)[],
  changedIndex: number,
): { from: number; to: number } | undefined {
  const changed = levels[changedIndex]
  if (changed === undefined) return undefined
  if (levels.some((level) => level === undefined)) return undefined

  let target = 0
  for (const [index, level] of levels.entries()) {
    if (index === changedIndex) continue
    if (level !== undefined && level < changed) target += 1
  }

  if (target === changedIndex) return undefined
  return { from: changedIndex, to: target }
}
