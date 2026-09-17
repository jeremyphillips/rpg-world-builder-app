import {
  formatTableValue,
  type GeneralTable,
  type GeneralTableRow,
  type TableColumnDef,
  type TableColumnValueType,
} from '@rpg/contracts'

import type { ProgressionTablePresentation } from '../../components/tables/progression-table-presentation'
import {
  createTableBuilderColumnKey,
  createTableBuilderRowKey,
  isTableBuilderCellBlank,
  parseCellDraft,
  tableBuilderColumnFallbackLabel,
  type TableBuilderCellDraft,
  type TableBuilderColumnDraft,
  type TableBuilderFormValues,
  type TableBuilderRowDraft,
} from './table-builder-draft'

type ParsedCellValue = number | string | { count: number; faces: number }

function createOpaqueTableId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `table-${Math.random().toString(36).slice(2)}`
}

function createOpaqueRowId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `row-${Math.random().toString(36).slice(2)}`
}

function resolveGeneralColumnId(column: TableBuilderColumnDraft, usedIds: Set<string>): string {
  const id = column.id ?? createOpaqueTableId()
  let resolved = id
  let suffix = 2
  while (usedIds.has(resolved)) {
    resolved = `${id}-${suffix}`
    suffix += 1
  }
  usedIds.add(resolved)
  return resolved
}

function resolveGeneralRowId(row: TableBuilderRowDraft, usedIds: Set<string>): string {
  const id = row.id ?? createOpaqueRowId()
  let resolved = id
  let suffix = 2
  while (usedIds.has(resolved)) {
    resolved = `${id}-${suffix}`
    suffix += 1
  }
  usedIds.add(resolved)
  return resolved
}

function cellDraftFromValue(column: TableColumnDef, value: ParsedCellValue): TableBuilderCellDraft {
  switch (column.valueType) {
    case 'number':
      return String(value)
    case 'dice':
      return {
        count: String((value as { count: number }).count),
        faces: String((value as { faces: number }).faces),
      }
    case 'text':
      return String(value)
  }
}

/** Inverts a persisted general table into a row-major authoring draft. */
export function generalTableToDraft(table: GeneralTable): TableBuilderFormValues {
  const columns: TableBuilderColumnDraft[] = table.columns.map((column) => ({
    key: createTableBuilderColumnKey(),
    id: column.id,
    label: column.label,
    valueType: column.valueType,
    format: column.valueType === 'number' ? (column.format ?? 'plain') : 'plain',
  }))

  const columnIdToKey = new Map(
    table.columns.map((column, index) => [column.id, columns[index]!.key]),
  )

  const rows: TableBuilderRowDraft[] = table.rows.map((row) => {
    const cells: Record<string, TableBuilderCellDraft | undefined> = {}
    for (const [columnId, value] of Object.entries(row.cells)) {
      const columnKey = columnIdToKey.get(columnId)
      const column = table.columns.find((candidate) => candidate.id === columnId)
      if (columnKey === undefined || column === undefined) continue
      cells[columnKey] = cellDraftFromValue(column, value as ParsedCellValue)
    }
    return { key: createTableBuilderRowKey(), id: row.id, cells }
  })

  return { kind: 'general', name: table.name, columns, rows }
}

type DraftToGeneralTableOptions = {
  existingTable?: Pick<GeneralTable, 'id'>
}

export function draftToGeneralTable(
  values: TableBuilderFormValues,
  options: DraftToGeneralTableOptions = {},
): GeneralTable {
  const usedColumnIds = new Set<string>(
    values.columns.flatMap((column) => (column.id !== undefined ? [column.id] : [])),
  )
  const usedRowIds = new Set<string>(
    values.rows.flatMap((row) => (row.id !== undefined ? [row.id] : [])),
  )

  const columns: TableColumnDef[] = values.columns.map((column) => {
    const id = resolveGeneralColumnId(column, usedColumnIds)
    const label = column.label.trim()

    switch (column.valueType) {
      case 'number':
        return {
          id,
          label,
          valueType: 'number',
          ...(column.format === 'signed' ? { format: 'signed' as const } : {}),
        }
      case 'dice':
        return { id, label, valueType: 'dice' }
      case 'text':
        return { id, label, valueType: 'text' }
    }
  })

  const columnKeys = values.columns.map((column) => column.key)
  const columnIds = columns.map((column) => column.id)

  const rows: GeneralTableRow[] = values.rows.map((row) => {
    const cells: Record<string, ParsedCellValue> = {}
    columnKeys.forEach((columnKey, index) => {
      const column = values.columns[index]
      const columnId = columnIds[index]
      if (column === undefined || columnId === undefined) return
      const value = parseCellDraft(column, row.cells[columnKey])
      if (value !== undefined) cells[columnId] = value
    })

    return {
      id: resolveGeneralRowId(row, usedRowIds),
      cells,
    }
  })

  return {
    id: options.existingTable?.id ?? createOpaqueTableId(),
    name: values.name.trim(),
    kind: 'general',
    columns,
    rows,
  }
}

export function generalDraftToPresentation(
  values: TableBuilderFormValues,
): ProgressionTablePresentation {
  const trimmedName = values.name.trim()

  return {
    ...(trimmedName === '' ? {} : { name: trimmedName }),
    columns: values.columns.map((column, index) => {
      const label = column.label.trim()
      return {
        key: column.key,
        label: label === '' ? tableBuilderColumnFallbackLabel(index) : label,
      }
    }),
    rows: values.rows.map((row) => ({
      values: Object.fromEntries(
        values.columns.map((column) => {
          const direct = parseCellDraft(column, row.cells[column.key])
          if (direct === undefined || isTableBuilderCellBlank(row.cells[column.key])) {
            return [column.key, undefined]
          }

          const pseudoColumn = {
            valueType: column.valueType,
            ...(column.valueType === 'number' && column.format === 'signed'
              ? { format: 'signed' as const }
              : {}),
          } as TableColumnDef

          return [column.key, formatTableValue(pseudoColumn, direct)]
        }),
      ),
    })),
  }
}

export function createGeneralTableBuilderColumnDraft(
  valueType: TableColumnValueType = 'text',
): TableBuilderColumnDraft {
  return {
    key: createTableBuilderColumnKey(),
    label: '',
    valueType,
    format: 'plain',
  }
}
